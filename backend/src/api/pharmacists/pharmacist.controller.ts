import { Request, Response } from 'express';
import { prisma } from '../../server';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';

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
        city: true,
        area: true,
        available: true,
        createdAt: true,
        updatedAt: true
      } as const // Use const assertion to preserve literal types
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
      city,
      area,
      available
    } = req.body;

    // Update profile with city (required) and area (optional)
    const updateData = {
      firstName,
      lastName,
      phoneNumber,
      bio,
      experience,
      education,
      city: city as string, // Ensure city is a string and required
      ...(area !== undefined && { area: area as string }), // Include area only if provided
      ...(available !== undefined && { available }) // Include available only if provided
    };
    
    const updatedProfile = await prisma.pharmacistProfile.update({
      where: { userId },
      data: updateData
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
        city: true,
        area: true,
        available: true,
        createdAt: true,
        updatedAt: true
      } as const // Use const assertion to preserve literal types
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

// Search for pharmacists based on city and other criteria
export const searchPharmacists = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { 
      city,
      area,
      available,
      page = '1',
      limit = '10'
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build the where clause
    const where: any = { 
      city: city as string,
      ...(area && { area: area as string }),
      ...(available === 'true' && { available: true })
    };

    // Get total count for pagination
    const total = await prisma.pharmacistProfile.count({ where });
    
    // Find pharmacists with pagination
    const pharmacists = await prisma.pharmacistProfile.findMany({
      where,
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      skip,
      take: limitNum,
      orderBy: {
        lastName: 'asc'
      }
    });

    // Calculate pagination metadata
    const pages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        pharmacists: pharmacists.map(({ user, ...pharmacist }) => ({
          ...pharmacist,
          email: user?.email || null
        })),
        pagination: {
          total,
          limit: limitNum,
          page: pageNum,
          pages
        },
        filters: {
          applied: {
            city,
            area: area || null,
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