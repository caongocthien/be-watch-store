import { useQuery } from '@tanstack/react-query'
import { createSearchParams, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getProducts } from '~/apis/product.api'
import Product from '~/components/Product'
import ProductSkeleton from '~/components/ProductSkeleton'
import { convertQueryStringToQueryObj, getIdFromNameId } from '~/utils/utils'
import QueryString from 'qs'
import { ProductListConfig } from '~/types/product.type'
import { getBrand } from '~/apis/brand.api'
import { getCategory } from '~/apis/category.api'
import CONSTANTS from '~/constants/constants'
import { Helmet } from 'react-helmet'

export type QueryConfig = {
  [key in keyof ProductListConfig]: string
}

export default function Products() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const { nameId } = useParams()
  const id = nameId && getIdFromNameId(nameId as string)
  const getBrandOrCategoryQuery = () => {
    if (pathname.includes('brand')) {
      return {
        filters: {
          bb_brand: {
            id: {
              $eq: id
            }
          }
        }
      }
    } else if (pathname.includes('category')) {
      return {
        filters: {
          bb_product_category: {
            id: {
              $eq: id
            }
          }
        }
      }
    } else {
      return {}
    }
  }

  const queryConfig = convertQueryStringToQueryObj(
    QueryString.stringify(
      {
        populate: '*',
        ...QueryString.parse(search.substring(1)),
        ...getBrandOrCategoryQuery()
      },
      {
        encodeValuesOnly: true // prettify URL
      }
    )
  )

  const categoryQuery = useQuery({
    queryKey: ['categoryName', pathname, id],
    queryFn: () => getCategory(id as string),
    keepPreviousData: true
  })

  const brandQuery = useQuery({
    queryKey: ['brandName', pathname, id],
    queryFn: () => getBrand(id as string),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })

  const productsQuery = useQuery({
    queryKey: ['products', pathname, queryConfig],
    queryFn: () => getProducts(queryConfig),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })

  const handlePriceOrder = (orderValue: string) => {
    navigate({
      pathname: pathname,
      search: createSearchParams({
        ...queryConfig,
        ...convertQueryStringToQueryObj(
          QueryString.stringify({
            sort: [`price:${orderValue}`]
          })
        )
      }).toString()
    })
  }

  return (
    <div className='container m-auto '>
      <Helmet>
        <title>
          {(pathname.includes('category') && categoryQuery.data?.data.data.attributes.name) ||
            (pathname.includes('brand') && brandQuery.data?.data.data.attributes.name) ||
            ''}
        </title>
        <meta
          name='description'
          content={
            (pathname.includes('category') && categoryQuery.data?.data.data.attributes.name) ||
            (pathname.includes('brand') && brandQuery.data?.data.data.attributes.name) ||
            ''
          }
        />
      </Helmet>
      <div className='py-16 mx-5'>
        <div className='text-base text-gray-400 mb-4'>Home/Skin Care</div>
        <div className='text-6xl mb-16'>
          {(pathname.includes('category') && categoryQuery.data?.data.data.attributes.name) ||
            (pathname.includes('brand') && brandQuery.data?.data.data.attributes.name) ||
            ''}
          {!pathname.includes('category') && !pathname.includes('brand') && CONSTANTS.allProducts}
        </div>
        {productsQuery.isFetching && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10'>
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        )}
        {!productsQuery.isFetching && (
          <>
            {productsQuery.data?.data.data.length === 0 && <div>Khong co san pham</div>}
            {productsQuery.data?.data.data.length !== 0 && (
              <>
                <div className='text-lg my-4 flex text-gray-600 justify-end'>
                  <select
                    className=' px-5 max-w-[200px] bg-gray-50 border border-gray-300 text-gray-900 text-sm outline-none  block w-full p-2.5 '
                    onChange={(event) => handlePriceOrder(event.target.value)}
                    defaultValue={''}
                  >
                    <option value='' defaultValue={''} disabled>
                      Giá
                    </option>
                    <option value='asc'>Giá: Thấp đến cao</option>
                    <option value='desc'>Giá: Cao đến thấp</option>
                  </select>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10'>
                  {productsQuery.data?.data.data.map((item, index) => {
                    return (
                      <div key={index} className='border p-4'>
                        <Product
                          id={item.id}
                          imgUrl={item.attributes.productImage.data[0].attributes.url}
                          name={item.attributes.name}
                          price={Number(item.attributes.price)}
                          price_discount={Number(item.attributes.discountPrice)}
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
