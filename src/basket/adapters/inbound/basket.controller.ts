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
import { BasketUseCases } from '../../application/use-cases/basket.use-cases';
import { CheckoutUseCases } from '../../application/use-cases/checkout.use-cases';
import {
  BasketPostRequestDto,
  BasketPutRequestDto,
  BasketBundlePostRequestDto,
  BasketBundlePutRequestDto,
  BasketCheckoutPostRequestDto,
  BasketGetResponseDto,
  BasketPricingGetResponseDto,
  BasketValidationGetResponseDto,
  BasketCheckoutPreviewGetResponseDto,
  BasketCheckoutPostResponseDto,
  BasketSuccessResponseDto,
} from './basket.dto';

/**
 * Basket controller - handles HTTP requests for basket operations
 */
@Controller('baskets')
export class BasketController {
  constructor(
    private readonly basketUseCases: BasketUseCases,
    private readonly checkoutUseCases: CheckoutUseCases,
  ) {}

  /**
   * Get basket for user
   */
  @Get(':userId')
  async getBasket(@Param('userId') userId: string): Promise<BasketGetResponseDto> {
    const basket = await this.basketUseCases.getBasketForUser(userId);
    return {
      basketId: basket.basketId,
      userId: basket.userId,
      items:
        basket.items?.map((i) => ({
          itemId: i.itemId,
          amount: i.amount,
        })) ?? [],
      bundles:
        basket.bundles?.map((b) => ({
          bundleId: b.bundleId,
          amount: b.amount,
        })) ?? [],
    };
  }

  /**
   * Add item to basket
   */
  @Post(':userId/items')
  async addItem(
    @Param('userId') userId: string,
    @Body() body: BasketPostRequestDto,
  ): Promise<BasketSuccessResponseDto> {
    const basket = await this.basketUseCases.addItem({
      userId,
      itemId: body.itemId,
      amount: body.amount,
    });
    return { success: true, basketId: basket.basketId };
  }

  /**
   * Update item amount
   */
  @Put(':userId/items/:itemId')
  async updateItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
    @Body() body: BasketPutRequestDto,
  ): Promise<BasketSuccessResponseDto> {
    try {
      const basket = await this.basketUseCases.updateItem({
        userId,
        itemId,
        amount: body.amount,
      });
      return { success: true, basketId: basket.basketId };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Update failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Remove item from basket
   */
  @Delete(':userId/items/:itemId')
  async removeItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
  ): Promise<BasketSuccessResponseDto> {
    await this.basketUseCases.removeItem({ userId, itemId });
    return { success: true };
  }

  /**
   * Add bundle to basket
   */
  @Post(':userId/bundles')
  async addBundle(
    @Param('userId') userId: string,
    @Body() body: BasketBundlePostRequestDto,
  ): Promise<BasketSuccessResponseDto> {
    const basket = await this.basketUseCases.addBundle({
      userId,
      bundleId: body.bundleId,
      amount: body.amount,
    });
    return { success: true, basketId: basket.basketId };
  }

  /**
   * Update bundle amount
   */
  @Put(':userId/bundles/:bundleId')
  async updateBundle(
    @Param('userId') userId: string,
    @Param('bundleId') bundleId: string,
    @Body() body: BasketBundlePutRequestDto,
  ): Promise<BasketSuccessResponseDto> {
    try {
      const basket = await this.basketUseCases.updateBundle({
        userId,
        bundleId,
        amount: body.amount,
      });
      return { success: true, basketId: basket.basketId };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Update failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Remove bundle from basket
   */
  @Delete(':userId/bundles/:bundleId')
  async removeBundle(
    @Param('userId') userId: string,
    @Param('bundleId') bundleId: string,
  ): Promise<BasketSuccessResponseDto> {
    await this.basketUseCases.removeBundle({ userId, bundleId });
    return { success: true };
  }

  /**
   * Clear basket
   */
  @Delete(':userId')
  async clearBasket(@Param('userId') userId: string): Promise<BasketSuccessResponseDto> {
    await this.basketUseCases.clearBasket(userId);
    return { success: true };
  }

  /**
   * Get basket pricing
   */
  @Get(':userId/pricing')
  async getPricing(@Param('userId') userId: string): Promise<BasketPricingGetResponseDto> {
    return this.basketUseCases.getBasketPricing(userId);
  }

  /**
   * Validate basket
   */
  @Get(':userId/validate')
  async validateBasket(@Param('userId') userId: string): Promise<BasketValidationGetResponseDto> {
    return this.basketUseCases.validateBasket(userId);
  }

  /**
   * Preview checkout
   */
  @Get(':userId/checkout/preview')
  async previewCheckout(@Param('userId') userId: string): Promise<BasketCheckoutPreviewGetResponseDto> {
    return this.checkoutUseCases.previewCheckout(userId);
  }

  /**
   * Checkout basket
   */
  @Post(':userId/checkout')
  async checkout(
    @Param('userId') userId: string,
    @Body() body: BasketCheckoutPostRequestDto,
  ): Promise<BasketCheckoutPostResponseDto> {
    const result = await this.checkoutUseCases.checkout({
      userId,
      businessPartnerId: body.businessPartnerId,
    });

    if (!result.success) {
      throw new HttpException(
        {
          error: result.error,
          validationErrors: result.validationErrors,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }
}
