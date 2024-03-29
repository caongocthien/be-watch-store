import { useMutation } from '@tanstack/react-query'
import { produce } from 'immer'
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { queryClient } from '~/App'
import { BodyUpdate, updateCart } from '~/apis/cart.api'
import QuantityController from '~/components/QuantityController'
import { useAppSelector } from '~/hooks/hooks'
import { Cart, CartItem } from '~/types/cart.type'
import { formatCurrency, generateNameId } from '~/utils/utils'

interface ExtendedCart extends CartItem {
  disabled: boolean
}

export default function Cart() {
  const cart = useAppSelector((state) => state.cart.cart)
  const cartItems = cart?.attributes.cart_item
  const [extendedCarts, setExtendedCarts] = useState<ExtendedCart[]>([])
  useEffect(() => {
    setExtendedCarts(
      cartItems?.map((cartItem) => ({
        ...cartItem,
        disabled: false
      })) || []
    )
  }, [cartItems])

  const updateCartMutation = useMutation((cart: { cardId: number; body: BodyUpdate[] }) =>
    updateCart(cart.cardId, cart.body)
  )

  const calculateSumPrice = (): number => {
    const arrPrice =
      cart &&
      cartItems?.map((item) => {
        const price = Number(item.bb_product.data.attributes.discountPrice || item.bb_product.data.attributes.price)
        return price * item.quantity
      })
    const price =
      arrPrice &&
      arrPrice?.reduce((prev, curr) => {
        return prev + curr
      }, 0)
    return price || 0
  }

  const calculateQuantity = (): number => {
    const arrQuantity =
      cartItems &&
      cartItems.map((item) => {
        return item.quantity
      })

    const quantity =
      arrQuantity &&
      arrQuantity.reduce((prev, curr) => {
        return Number(prev) + Number(curr)
      }, 0)

    return quantity || 0
  }

  const deleteProductInCart = (productId: number) => {
    cartItems &&
      updateCartMutation.mutate(
        {
          cardId: cart?.id,
          body: [
            ...cartItems
              .filter((item) => {
                return item.bb_product.data.id !== productId
              })
              .map((item) => ({
                quantity: item.quantity,
                bb_product: item.bb_product.data.id
              }))
          ]
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
          }
        }
      )
  }
  const handleTypeQuantity = (cartItemIndex: number) => (value: number) => {
    setExtendedCarts(
      produce((draft) => {
        draft[cartItemIndex].quantity = value
      })
    )
  }
  const handleQuantity = (cartItemIndex: number, value: number, enable: boolean) => {
    if (enable) {
      const cartItem = extendedCarts[cartItemIndex]
      setExtendedCarts(
        produce((draft) => {
          draft[cartItemIndex].disabled = true
        })
      )
      cart &&
        updateCartMutation.mutate(
          {
            cardId: cart?.id as number,
            body: [
              ...extendedCarts.map((item) => {
                if (item.id === cartItem.id) {
                  return {
                    quantity: Number(value),
                    bb_product: item.bb_product.data.id
                  }
                }
                return {
                  quantity: item.quantity,
                  bb_product: item.bb_product.data.id
                }
              })
            ]
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['cart'] })
            }
          }
        )
    }
  }

  return (
    <div className='container m-auto'>
      <Helmet>
        <title>Giỏ hàng</title>
        <meta name='description' content='Giỏ hàng watch store' />
      </Helmet>
      <div className=' mx-5'>
        <div className='flex justify-center text-4xl capitalize py-10'>Giỏ hàng</div>
        {calculateQuantity() !== 0 ? (
          <div className='relative overflow-x-auto'>
            <table className='w-full text-sm text-left text-gray-500 '>
              <thead className='text-gray-700 uppercase bg-gray-100 text-center'>
                <tr>
                  <th scope='col' className='px-6 py-3 rounded-l-lg'>
                    Sản phẩm
                  </th>
                  <th scope='col' className='px-6 py-3'>
                    Số lượng
                  </th>
                  <th scope='col' className='px-6 py-3 rounded-r-lg'>
                    Giá
                  </th>
                  <th scope='col' className='px-6 py-3 rounded-r-lg'>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className='text-center'>
                {extendedCarts?.map((item, index) => (
                  <tr key={item.id} className='text-base bg-white border-b-2'>
                    <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap '>
                      <Link
                        to={`/product/${generateNameId({
                          name: item.bb_product.data.attributes.name,
                          id: item.bb_product.data.id
                        })}`}
                        className='flex items-center '
                      >
                        <img
                          src={item.bb_product.data.attributes.productImage.data[0].attributes.url}
                          alt=''
                          className='w-16 pr-4'
                        />
                        {item.bb_product.data.attributes.name}
                      </Link>
                    </th>
                    <td className='px-6 py-4 flex justify-center'>
                      <QuantityController
                        disableComponent={item.disabled}
                        max={item.bb_product.data.attributes.inventory}
                        value={item.quantity}
                        onIncrease={(value) =>
                          handleQuantity(index, value, value < item.bb_product.data.attributes.inventory)
                        }
                        onDecrease={(value) => handleQuantity(index, value, value >= 1)}
                        onType={handleTypeQuantity(index)}
                        onFocusOut={(value) =>
                          handleQuantity(index, value, value !== (cartItems as CartItem[])[index].quantity)
                        }
                        disabled={item.disabled}
                      />
                    </td>
                    <td className='px-6 py-4'>
                      {formatCurrency(
                        Number(item.bb_product.data.attributes.discountPrice || item.bb_product.data.attributes.price) *
                          item.quantity
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <button onClick={() => deleteProductInCart(item.bb_product.data.id)}>Xóa sản phẩm</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className='text-center'>
                <tr className='text-base font-semibold text-gray-900 '>
                  <th scope='row' className='px-6 py-3 text-base'>
                    Tổng
                  </th>
                  <td className='px-6 py-3'>{calculateQuantity()}</td>
                  <td className='px-6 py-3'>{formatCurrency(calculateSumPrice())}</td>
                </tr>
              </tfoot>
            </table>
            <div>
              <Link
                to={'/checkout'}
                // disabled={updateCartMutation.isLoading}
                className='float-right bg-pink-200 px-10 py-3 rounded-md shadow-sm'
              >
                Thanh toán
              </Link>
            </div>
          </div>
        ) : (
          <div className='flex justify-center'>
            <img
              src='https://assets.materialup.com/uploads/16e7d0ed-140b-4f86-9b7e-d9d1c04edb2b/preview.png'
              alt='Empty cart'
              className='max-w-xs '
            />
          </div>
        )}
      </div>
    </div>
  )
}
