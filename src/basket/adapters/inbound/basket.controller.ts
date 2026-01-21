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
import { BasketUseCases, BasketData } from '../../application/use-cases/basket.use-cases';
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
@ApiTags('Baskets')
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
  @ApiOperation({
    summary: 'Get user basket',
    description: 'Retrieves the current basket contents for a specific user, including all items and bundles.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Basket retrieved successfully',
    type: BasketGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found or basket does not exist',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getBasket(
    @Param('userId') userId: string,
  ): Promise<BasketGetResponseDto> {
    const basket = await this.basketUseCases.getBasketForUser(userId);
    return {
      basketId: basket.basketId,
      userId: basket.userId,
      items: basket.items,
      bundles: basket.bundles,
    };
  }

  /**
   * Add item to basket
   */
  @Post(':userId/items')
  @ApiOperation({
    summary: 'Add item to basket',
    description: 'Adds a new item to the user\'s basket or increases the quantity if the item already exists.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiBody({
    type: BasketPostRequestDto,
    description: 'Item details to add to the basket',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added successfully',
    type: BasketSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data or item not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Item not found or invalid quantity' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async addItem(
    @Param('userId') userId: string,
    @Body() body: BasketPostRequestDto,
  ): Promise<BasketSuccessResponseDto> {
    const basketData = await this.basketUseCases.addItem({
      userId,
      itemId: body.itemId,
      amount: body.amount,
    });
    return { success: true, basketId: basketData.basketId };
  }

  /**
   * Update item amount
   */
  @Put(':userId/items/:itemId')
  @ApiOperation({
    summary: 'Update item quantity in basket',
    description: 'Updates the quantity of a specific item in the user\'s basket.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiParam({
    name: 'itemId',
    description: 'The unique identifier of the item to update',
    example: 'item-123',
  })
  @ApiBody({
    type: BasketPutRequestDto,
    description: 'New quantity for the item',
  })
  @ApiResponse({
    status: 200,
    description: 'Item quantity updated successfully',
    type: BasketSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid quantity, item not in basket, or business logic error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid quantity or item not found in basket' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User or item not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found or item not in basket' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async updateItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
    @Body() body: BasketPutRequestDto,
  ): Promise<BasketSuccessResponseDto> {
    try {
      const basketData = await this.basketUseCases.updateItem({
        userId,
        itemId,
        amount: body.amount,
      });
      return { success: true, basketId: basketData.basketId };
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
  @ApiOperation({
    summary: 'Remove item from basket',
    description: 'Completely removes a specific item from the user\'s basket.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiParam({
    name: 'itemId',
    description: 'The unique identifier of the item to remove',
    example: 'item-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed successfully',
    type: BasketSuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User or item not found in basket',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found or item not in basket' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Add bundle to basket',
    description: 'Adds a bundle to the user\'s basket or increases the quantity if the bundle already exists.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiBody({
    type: BasketBundlePostRequestDto,
    description: 'Bundle details to add to the basket',
  })
  @ApiResponse({
    status: 201,
    description: 'Bundle added successfully',
    type: BasketSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data or bundle not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Bundle not found or invalid quantity' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User or bundle not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found or bundle not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async addBundle(
    @Param('userId') userId: string,
    @Body() body: BasketBundlePostRequestDto,
  ): Promise<BasketSuccessResponseDto> {
    const basketData = await this.basketUseCases.addBundle({
      userId,
      bundleId: body.bundleId,
      amount: body.amount,
    });
    return { success: true, basketId: basketData.basketId };
  }

  /**
   * Update bundle amount
   */
  @Put(':userId/bundles/:bundleId')
  @ApiOperation({
    summary: 'Update bundle quantity in basket',
    description: 'Updates the quantity of a specific bundle in the user\'s basket.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiParam({
    name: 'bundleId',
    description: 'The unique identifier of the bundle to update',
    example: 'bundle-789',
  })
  @ApiBody({
    type: BasketBundlePutRequestDto,
    description: 'New quantity for the bundle',
  })
  @ApiResponse({
    status: 200,
    description: 'Bundle quantity updated successfully',
    type: BasketSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid quantity, bundle not in basket, or business logic error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid quantity or bundle not found in basket' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User or bundle not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found or bundle not in basket' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async updateBundle(
    @Param('userId') userId: string,
    @Param('bundleId') bundleId: string,
    @Body() body: BasketBundlePutRequestDto,
  ): Promise<BasketSuccessResponseDto> {
    try {
      const basketData = await this.basketUseCases.updateBundle({
        userId,
        bundleId,
        amount: body.amount,
      });
      return { success: true, basketId: basketData.basketId };
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
  @ApiOperation({
    summary: 'Remove bundle from basket',
    description: 'Completely removes a specific bundle from the user\'s basket.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiParam({
    name: 'bundleId',
    description: 'The unique identifier of the bundle to remove',
    example: 'bundle-789',
  })
  @ApiResponse({
    status: 200,
    description: 'Bundle removed successfully',
    type: BasketSuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User or bundle not found in basket',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found or bundle not in basket' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Clear entire basket',
    description: 'Removes all items and bundles from the user\'s basket.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Basket cleared successfully',
    type: BasketSuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async clearBasket(
    @Param('userId') userId: string,
  ): Promise<BasketSuccessResponseDto> {
    await this.basketUseCases.clearBasket(userId);
    return { success: true };
  }

  /**
   * Get basket pricing
   */
  @Get(':userId/pricing')
  @ApiOperation({
    summary: 'Get basket pricing information',
    description: 'Calculates and returns the pricing breakdown for the user\'s basket, including subtotal, discounts, and total.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing calculated successfully',
    type: BasketPricingGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User or basket not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found or basket is empty' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getPricing(
    @Param('userId') userId: string,
  ): Promise<BasketPricingGetResponseDto> {
    return this.basketUseCases.getBasketPricing(userId);
  }

  /**
   * Validate basket
   */
  @Get(':userId/validate')
  @ApiOperation({
    summary: 'Validate basket contents',
    description: 'Validates the basket contents against business rules and returns any validation errors.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Basket validation completed',
    type: BasketValidationGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async validateBasket(
    @Param('userId') userId: string,
  ): Promise<BasketValidationGetResponseDto> {
    return this.basketUseCases.validateBasket(userId);
  }

  /**
   * Preview checkout
   */
  @Get(':userId/checkout/preview')
  @ApiOperation({
    summary: 'Preview checkout process',
    description: 'Provides a preview of the checkout process, including final pricing and validation status.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout preview generated successfully',
    type: BasketCheckoutPreviewGetResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User or basket not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found or basket is empty' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async previewCheckout(
    @Param('userId') userId: string,
  ): Promise<BasketCheckoutPreviewGetResponseDto> {
    return this.checkoutUseCases.previewCheckout(userId);
  }

  /**
   * Checkout basket
   */
  @Post(':userId/checkout')
  @ApiOperation({
    summary: 'Checkout basket',
    description: 'Processes the checkout for the user\'s basket, creating an order and initiating the order fulfillment process.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: 'user-456',
  })
  @ApiBody({
    type: BasketCheckoutPostRequestDto,
    description: 'Checkout options including business partner information',
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout completed successfully, order created',
    type: BasketCheckoutPostResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Checkout validation failed or business logic error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Basket validation failed' },
            validationErrors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  checkName: { type: 'string', example: 'minimum_order_value' },
                  message: { type: 'string', example: 'Order must be at least €10.00' },
                },
              },
            },
          },
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User or basket not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found or basket is empty' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
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
