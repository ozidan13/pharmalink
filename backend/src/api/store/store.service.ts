import { Prisma, Product, PharmacyOwnerProfile } from '@prisma/client';
import { prisma } from '../../server';
import { calculateDistance, getBoundingBox } from '../../utils/geospatial';

type ProductWithPharmacy = Product & {
  pharmacyOwner: Pick<
    PharmacyOwnerProfile,
    'id' | 'pharmacyName' | 'contactPerson' | 'phoneNumber' | 'address' | 'latitude' | 'longitude'
  >;
  distance?: number;
};

interface SearchProductsParams {
  query?: string;
  category?: string | string[];
  nearExpiry?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  pharmacyId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number; // in kilometers
  sortBy?: 'price' | 'expiryDate' | 'createdAt' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchProductsResult {
  products: ProductWithPharmacy[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters?: {
    categories: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

/**
 * Search for products with advanced filtering and geospatial search
 */
export const searchProductsService = async ({
  query,
  category,
  nearExpiry,
  minPrice,
  maxPrice,
  inStock,
  pharmacyId,
  latitude,
  longitude,
  radiusKm = 10, // Default 10km radius
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 10,
}: SearchProductsParams): Promise<SearchProductsResult> => {
  try {
    // Input validation
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));

    // Build base filter
    const baseFilter: Prisma.ProductWhereInput = {
      AND: [
        // Text search on name and description
        query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {},
        // Category filter (supports single or multiple categories)
        category
          ? Array.isArray(category)
            ? { category: { in: category } }
            : { category }
          : {},
        // Near expiry filter
        nearExpiry ? { isNearExpiry: true } : {},
        // Price range filter
        {
          AND: [
            minPrice !== undefined ? { price: { gte: minPrice } } : {},
            maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
          ],
        },
        // Stock filter
        inStock ? { stock: { gt: 0 } } : {},
        // Pharmacy filter
        pharmacyId ? { pharmacyOwnerId: pharmacyId } : {},
      ],
    };

    // Handle geospatial filtering if coordinates are provided
    let pharmacyFilter: Prisma.PharmacyOwnerProfileWhereInput | undefined;
    if (latitude && longitude) {
      const bbox = getBoundingBox(latitude, longitude, radiusKm);
      
      pharmacyFilter = {
        AND: [
          { latitude: { gte: bbox.minLat } },
          { latitude: { lte: bbox.maxLat } },
          { longitude: { gte: bbox.minLon } },
          { longitude: { lte: bbox.maxLon } },
        ],
      };
    }

    // Get total count and products in parallel
    const [totalCount, products, allCategories, priceRange] = await Promise.all([
      // Get total count
      prisma.product.count({
        where: {
          ...baseFilter,
          ...(pharmacyFilter ? { pharmacyOwner: pharmacyFilter } : {}),
        },
      }),

      // Get paginated products
      prisma.product.findMany({
        where: {
          ...baseFilter,
          ...(pharmacyFilter ? { pharmacyOwner: pharmacyFilter } : {}),
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy === 'distance' ? 'createdAt' : sortBy]: sortOrder,
        } as Prisma.ProductOrderByWithRelationInput,
        include: {
          pharmacyOwner: {
            select: {
              id: true,
              pharmacyName: true,
              contactPerson: true,
              phoneNumber: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      }) as Promise<ProductWithPharmacy[]>,

      // Get all categories for filters
      prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
      }),

      // Get price range for filters
      prisma.product.aggregate({
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    // Calculate distances if coordinates are provided
    const productsWithDistance = products.map((product) => {
      if (!latitude || !longitude || !product.pharmacyOwner.latitude || !product.pharmacyOwner.longitude) {
        return product;
      }

      const distance = calculateDistance(
        latitude,
        longitude,
        product.pharmacyOwner.latitude,
        product.pharmacyOwner.longitude
      );

      return {
        ...product,
        distance,
      } as ProductWithPharmacy;
    });

    // Sort by distance if needed
    if (sortBy === 'distance' && latitude && longitude) {
      productsWithDistance.sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return sortOrder === 'asc' ? distA - distB : distB - distA;
      });
    }

    // Convert Decimal to number for price range
    const minPriceValue = priceRange._min.price !== null ? Number(priceRange._min.price) : 0;
    const maxPriceValue = priceRange._max.price !== null ? Number(priceRange._max.price) : 0;

    return {
      products: productsWithDistance,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
      filters: {
        categories: [...new Set(allCategories.map((p) => p.category))],
        priceRange: {
          min: minPriceValue,
          max: maxPriceValue,
        },
      },
    };
  } catch (error) {
    console.error('Error in searchProductsService:', error);
    throw new Error('Failed to search products');
  }
};