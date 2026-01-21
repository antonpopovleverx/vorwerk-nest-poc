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
import { BundleUseCases } from '../../application/use-cases/bundle.use-cases';
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
@Controller('bundles')
export class BundleController {
  constructor(private readonly bundleUseCases: BundleUseCases) {}

  /**
   * Create a new bundle
   */
  @Post()
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
  async getAllBundles(): Promise<BundleGetQueryResponseDto> {
    const bundles = await this.bundleUseCases.getAllBundles();
    return { bundles: bundles.map((b) => this.mapBundleToResponse(b)) };
  }

  /**
   * Get active bundles only
   */
  @Get('active')
  async getActiveBundles(): Promise<BundleGetQueryResponseDto> {
    const bundles = await this.bundleUseCases.getActiveBundles();
    return { bundles: bundles.map((b) => this.mapBundleToResponse(b)) };
  }

  /**
   * Get bundle by ID
   */
  @Get(':bundleId')
  async getBundle(
    @Param('bundleId') bundleId: string,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.getBundle(bundleId);
    if (!bundle) {
      throw new HttpException('Bundle not found', HttpStatus.NOT_FOUND);
    }
    return this.mapBundleToResponse(bundle);
  }

  /**
   * Update bundle
   */
  @Put(':bundleId')
  async updateBundle(
    @Param('bundleId') bundleId: string,
    @Body() dto: BundlePutRequestDto,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.updateBundle(bundleId, dto);
    if (!bundle) {
      throw new HttpException('Bundle not found', HttpStatus.NOT_FOUND);
    }
    return this.mapBundleToResponse(bundle);
  }

  /**
   * Delete bundle
   */
  @Delete(':bundleId')
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
  async addItemToBundle(
    @Param('bundleId') bundleId: string,
    @Body() body: BundleItemPostRequestDto,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.addItemToBundle(bundleId, body);
    if (!bundle) {
      throw new HttpException('Bundle not found', HttpStatus.NOT_FOUND);
    }
    return this.mapBundleToResponse(bundle);
  }

  /**
   * Update item quantity in bundle
   */
  @Put(':bundleId/items/:itemId')
  async updateBundleItem(
    @Param('bundleId') bundleId: string,
    @Param('itemId') itemId: string,
    @Body() body: BundleItemPutRequestDto,
  ): Promise<BundleGetResponseDto> {
    try {
      const bundle = await this.bundleUseCases.updateBundleItemQuantity(
        bundleId,
        itemId,
        body.quantity,
      );
      if (!bundle) {
        throw new HttpException('Bundle not found', HttpStatus.NOT_FOUND);
      }
      return this.mapBundleToResponse(bundle);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Update failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Remove item from bundle
   */
  @Delete(':bundleId/items/:itemId')
  async removeItemFromBundle(
    @Param('bundleId') bundleId: string,
    @Param('itemId') itemId: string,
  ): Promise<BundleGetResponseDto> {
    const bundle = await this.bundleUseCases.removeItemFromBundle(
      bundleId,
      itemId,
    );
    if (!bundle) {
      throw new HttpException('Bundle not found', HttpStatus.NOT_FOUND);
    }
    return this.mapBundleToResponse(bundle);
  }

  private mapBundleToResponse(bundle: any): BundleGetResponseDto {
    return {
      bundleId: bundle.bundleId,
      name: bundle.name,
      description: bundle.description,
      basePrice: bundle.basePrice.amount,
      discountRate: bundle.discountRate,
      discountedPrice: bundle.getDiscountedPrice().amount,
      isActive: bundle.isActive,
      contents:
        bundle.contents?.map((c: any) => ({
          itemId: c.itemId,
          quantity: c.quantity.value,
        })) ?? [],
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
    };
  }
}
