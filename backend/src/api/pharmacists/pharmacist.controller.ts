import { Request, Response } from 'express';
import { prisma } from '../../server';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';

// Get the current pharmacist's profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const profile = await prisma.pharmacistProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        cvUrl: true,
        bio: true,
        experience: true,
        education: true,
        latitude: true,
        longitude: true,
        available: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Pharmacist profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update the current pharmacist's profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      bio,
      experience,
      education,
      latitude,
      longitude,
      available
    } = req.body;

    // Update profile
    const updatedProfile = await prisma.pharmacistProfile.update({
      where: { userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
        bio,
        experience,
        education,
        latitude,
        longitude,
        available: available !== undefined ? available : undefined
      }
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Get a specific pharmacist by ID (for pharmacy owners)
export const getPharmacistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if the pharmacy owner has a valid subscription
    const pharmacyOwner = await prisma.pharmacyOwnerProfile.findUnique({
      where: { userId: req.user?.id }
    });

    if (!pharmacyOwner) {
      return res.status(404).json({ message: 'Pharmacy owner profile not found' });
    }

    // Basic subscription check (can be expanded based on business rules)
    const hasValidSubscription = 
      pharmacyOwner.subscriptionStatus !== 'none' && 
      (!pharmacyOwner.subscriptionExpiresAt || new Date(pharmacyOwner.subscriptionExpiresAt) > new Date());

    if (!hasValidSubscription) {
      return res.status(403).json({ message: 'Active subscription required to view pharmacist details' });
    }

    // Get pharmacist profile
    const pharmacist = await prisma.pharmacistProfile.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        cvUrl: true,
        bio: true,
        experience: true,
        education: true,
        latitude: true,
        longitude: true,
        available: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    return res.status(200).json(pharmacist);
  } catch (error) {
    console.error('Error fetching pharmacist:', error);
    return res.status(500).json({ message: 'Server error while fetching pharmacist' });
  }
};

// Search for pharmacists based on location and other criteria
export const searchPharmacists = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      latitude, 
      longitude, 
      radius = '10', // Default to 10km if not provided
      available 
    } = req.query;

    // Convert radius to number and validate
    const searchRadius = Math.min(Number(radius), 100); // Cap at 100km
    
    // Build the availability filter
    const availabilityFilter = available === 'true' ? 'AND "available" = true' : '';

    // Use PostGIS to find pharmacists within the radius with parameterized query
    const pharmacists = await prisma.$queryRaw<any[]>`
      SELECT 
        id, 
        "firstName", 
        "lastName", 
        "phoneNumber", 
        "cvUrl", 
        bio, 
        experience, 
        education, 
        latitude, 
        longitude, 
        "available",
        ST_Distance(
          ST_MakePoint("longitude", "latitude")::geography, 
          ST_MakePoint(${Number(longitude)}, ${Number(latitude)})::geography
        ) / 1000 AS "distanceKm" 
      FROM "PharmacistProfile" 
      WHERE ST_DWithin(
        ST_MakePoint("longitude", "latitude")::geography, 
        ST_MakePoint(${Number(longitude)}, ${Number(latitude)})::geography, 
        ${searchRadius * 1000}
      ) ${availabilityFilter}
      ORDER BY "distanceKm" ASC
      LIMIT 100; -- Limit results to prevent performance issues
    `;

    return res.status(200).json({
      success: true,
      data: {
        pharmacists,
        pagination: {
          total: pharmacists.length,
          limit: 100,
          page: 1,
          pages: 1
        },
        filters: {
          applied: {
            latitude: Number(latitude),
            longitude: Number(longitude),
            radius: searchRadius,
            available: available === 'true'
          }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error searching pharmacists:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to search pharmacists',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Upload CV for pharmacist
export const uploadCV = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'cvs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Get file path
    const filePath = req.file.path;
    const fileUrl = `/uploads/cvs/${path.basename(filePath)}`;

    // Update pharmacist profile with CV URL
    const updatedProfile = await prisma.pharmacistProfile.update({
      where: { userId },
      data: { cvUrl: fileUrl }
    });

    return res.status(200).json({
      message: 'CV uploaded successfully',
      cvUrl: updatedProfile.cvUrl
    });
  } catch (error) {
    console.error('Error uploading CV:', error);
    return res.status(500).json({ message: 'Server error while uploading CV' });
  }
};