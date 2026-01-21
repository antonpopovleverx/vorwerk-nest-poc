import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  BundleUseCases,
  BundleData,
} from '../../application/use-cases/bundle.use-cases';
import {
  BundlePostRequestDto,
  BundlePutRequestDto,
  BundleItemPostRequestDto,
  BundleItemPutRequestDto,
  BundleGetResponseDto,
  BundleGetQueryResponseDto,
  BundleSuccessResponseDto,
} from './bundle.dto';

/**
 * Bundle controller - handles HTTP requests for bundle management
 */
@ApiTags('Bundles')
@Controller('bundles')
export class BundleController {
  constructor(private readonly bundleUseCases: BundleUseCases) {}

  /**
   * Create a new bundle
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new bundle',
    description:
      'Creates a new product bundle with specified items, pricing, and discount information.',
  })
  @ApiBody({
    type: BundlePostRequestDto,
    description:
      'Bundle creation data including name, description, pricing, and items',
  })
  @ApiResponse({
    status: 201,
    description: 'Bundle created successfully',
    type: BundleGetResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid bundle data or validation errors',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Invalid discount rate or missing required fields',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async createBundle(
    @Body() dto: BundlePostRequestDto,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.createBundle(dto);
    return this.mapBundleToResponse(bundle);
  }

  /**
   * Get all bundles
   */
  @Get()
  @ApiOperation({
    summary: 'Get all bundles',
    description:
      'Retrieves a list of all bundles in the system, both active and inactive.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bundles retrieved successfully',
    type: BundleGetQueryResponseDto,
  })
  async getAllBundles(): Promise<BundleGetQueryResponseDto> {
    const bundles = await this.bundleUseCases.getAllBundles();
    return { bundles: bundles.map((b) => this.mapBundleToResponse(b)) };
  }

  /**
   * Get active bundles only
   */
  @Get('active')
  @ApiOperation({
    summary: 'Get active bundles',
    description:
      'Retrieves a list of all currently active bundles available for purchase.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active bundles retrieved successfully',
    type: BundleGetQueryResponseDto,
  })
  async getActiveBundles(): Promise<BundleGetQueryResponseDto> {
    const bundles = await this.bundleUseCases.getActiveBundles();
    return { bundles: bundles.map((b) => this.mapBundleToResponse(b)) };
  }

  /**
   * Get bundle by ID
   */
  @Get(':bundleId')
  @ApiOperation({
    summary: 'Get bundle by ID',
    description:
      'Retrieves detailed information about a specific bundle by its unique identifier.',
  })
  @ApiParam({
    name: 'bundleId',
    description: 'The unique identifier of the bundle',
    example: 'bundle-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Bundle retrieved successfully',
    type: BundleGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Bundle not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Bundle not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getBundle(
    @Param('bundleId') bundleId: string,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.getBundle(bundleId);
    return this.mapBundleToResponse(bundle);
  }

  /**
   * Update bundle
   */
  @Put(':bundleId')
  @ApiOperation({
    summary: 'Update bundle',
    description:
      'Updates an existing bundle with new information such as name, description, pricing, or active status.',
  })
  @ApiParam({
    name: 'bundleId',
    description: 'The unique identifier of the bundle to update',
    example: 'bundle-123',
  })
  @ApiBody({
    type: BundlePutRequestDto,
    description: 'Bundle update data (all fields are optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Bundle updated successfully',
    type: BundleGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Bundle not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Bundle not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid update data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Invalid discount rate or other validation error',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async updateBundle(
    @Param('bundleId') bundleId: string,
    @Body() dto: BundlePutRequestDto,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.updateBundle(bundleId, dto);
    return this.mapBundleToResponse(bundle);
  }

  /**
   * Delete bundle
   */
  @Delete(':bundleId')
  @ApiOperation({
    summary: 'Delete bundle',
    description:
      'Permanently deletes a bundle from the system. This operation cannot be undone.',
  })
  @ApiParam({
    name: 'bundleId',
    description: 'The unique identifier of the bundle to delete',
    example: 'bundle-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Bundle deleted successfully',
    type: BundleSuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Bundle not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Bundle not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async deleteBundle(
    @Param('bundleId') bundleId: string,
  ): Promise<BundleSuccessResponseDto> {
    await this.bundleUseCases.deleteBundle(bundleId);
    return { success: true };
  }

  /**
   * Add item to bundle
   */
  @Post(':bundleId/items')
  @ApiOperation({
    summary: 'Add item to bundle',
    description:
      'Adds a new item to an existing bundle with the specified quantity.',
  })
  @ApiParam({
    name: 'bundleId',
    description: 'The unique identifier of the bundle',
    example: 'bundle-123',
  })
  @ApiBody({
    type: BundleItemPostRequestDto,
    description: 'Item details to add to the bundle',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to bundle successfully',
    type: BundleGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Bundle or item not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Bundle not found or item does not exist',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Item already exists in bundle or invalid data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Item already exists in bundle' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async addItemToBundle(
    @Param('bundleId') bundleId: string,
    @Body() body: BundleItemPostRequestDto,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.addItemToBundle(bundleId, body);
    return this.mapBundleToResponse(bundle);
  }

  /**
   * Update item quantity in bundle
   */
  @Put(':bundleId/items/:itemId')
  @ApiOperation({
    summary: 'Update item quantity in bundle',
    description: 'Updates the quantity of a specific item within a bundle.',
  })
  @ApiParam({
    name: 'bundleId',
    description: 'The unique identifier of the bundle',
    example: 'bundle-123',
  })
  @ApiParam({
    name: 'itemId',
    description: 'The unique identifier of the item in the bundle',
    example: 'item-456',
  })
  @ApiBody({
    type: BundleItemPutRequestDto,
    description: 'New quantity for the item',
  })
  @ApiResponse({
    status: 200,
    description: 'Item quantity updated successfully',
    type: BundleGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Bundle or item not found in bundle',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Bundle not found or item not in bundle',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid quantity or business logic error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Invalid quantity - must be greater than 0',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async updateBundleItem(
    @Param('bundleId') bundleId: string,
    @Param('itemId') itemId: string,
    @Body() body: BundleItemPutRequestDto,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.updateBundleItemQuantity(
      bundleId,
      itemId,
      body.quantity,
    );
    return this.mapBundleToResponse(bundle);
  }

  /**
   * Remove item from bundle
   */
  @Delete(':bundleId/items/:itemId')
  @ApiOperation({
    summary: 'Remove item from bundle',
    description:
      'Removes a specific item from a bundle. The bundle must contain at least one item.',
  })
  @ApiParam({
    name: 'bundleId',
    description: 'The unique identifier of the bundle',
    example: 'bundle-123',
  })
  @ApiParam({
    name: 'itemId',
    description: 'The unique identifier of the item to remove',
    example: 'item-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed from bundle successfully',
    type: BundleGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Bundle or item not found in bundle',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Bundle not found or item not in bundle',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Cannot remove item (bundle must have at least one item)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Bundle must contain at least one item',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async removeItemFromBundle(
    @Param('bundleId') bundleId: string,
    @Param('itemId') itemId: string,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.removeItemFromBundle(
      bundleId,
      itemId,
    );
    return this.mapBundleToResponse(bundle);
  }

  private mapBundleToResponse(bundle: BundleData): BundleGetResponseDto {
    return {
      bundleId: bundle.bundleId,
      name: bundle.name,
      description: bundle.description,
      basePrice: bundle.basePrice,
      discountRate: bundle.discountRate,
      discountedPrice: bundle.discountedPrice,
      isActive: bundle.isActive,
      contents: bundle.contents,
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
    };
  }
}
