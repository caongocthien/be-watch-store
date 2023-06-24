import { useQuery } from '@tanstack/react-query'
import { useLayoutEffect, useState } from 'react'
import { Controller, ControllerProps } from 'react-hook-form'
import { getProvinces } from '~/apis/provinces.api'
import { Districts, Provinces, Ward } from '~/types/provinces.type'
import { User } from '~/types/user.type'
import { getUserToLocalStorage } from '~/utils/utils'

interface Props {
  control?: any
}

export default function Address({ control }: Props) {
  const user: User = JSON.parse(getUserToLocalStorage() || '')
  const userAddress = user.address && user.address.split('-')

  const getProvincesQuery = useQuery({
    queryKey: ['provinces'],
    queryFn: getProvinces
  })

  const [provinces, setProvinces] = useState<Provinces[]>([])
  const [districts, setDistricts] = useState<Districts[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  useLayoutEffect(() => {
    setProvinces(getProvincesQuery.data?.data)
  }, [getProvincesQuery.data?.data])

  useLayoutEffect(() => {
    setDistricts(getProvincesQuery.data?.data.find((item: Provinces) => item.code === Number(userAddress[0])).districts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProvincesQuery.data?.data])

  useLayoutEffect(() => {
    setWards(
      getProvincesQuery.data?.data
        .find((item: Provinces) => item.code === Number(userAddress[0]))
        .districts.find((item: Districts) => item.code === Number(userAddress[1])).wards
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProvincesQuery.data?.data])

  function handleChangeProvinces(event: React.ChangeEvent<HTMLSelectElement>) {
    const provinceCurrent = Number(event.target.value)
    const province = provinces.find((item) => item.code === provinceCurrent)
    setDistricts(province?.districts as Districts[])
    setWards([])
  }

  const handleChangeDistrict = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCurrent = Number(event.target.value)
    const district = districts.find((item) => item.code === districtCurrent)
    setWards(district?.wards as Ward[])
  }

  return (
    <div>
      <div className='flex text-xl py-3 items-center'>
        <p className='min-w-[5rem]'>Tỉnh:</p>
        <Controller
          control={control}
          name='provinces'
          defaultValue={userAddress[0]}
          render={({ field: { onChange, value } }) => (
            <select
              className='ml-4 p-1'
              value={value}
              onChange={(e) => {
                onChange(e)
                handleChangeProvinces(e)
              }}
            >
              <option>Chọn Tỉnh / Thành Phố</option>
              {provinces &&
                provinces.map((province) => {
                  return (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  )
                })}
            </select>
          )}
        />
      </div>
      <div className='flex text-xl py-3 items-center'>
        <p className='min-w-[5rem]'>Quận:</p>
        <Controller
          control={control}
          name='district'
          defaultValue={userAddress[1]}
          render={({ field: { onChange, value } }) => (
            <select
              className='ml-4 p-1'
              value={value}
              onChange={(e) => {
                onChange(e)
                handleChangeDistrict(e)
              }}
            >
              <option>Chọn Quận / Huyện</option>
              {districts &&
                districts.map((district) => {
                  return (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  )
                })}
            </select>
          )}
        />
      </div>
      <div className='flex text-xl py-3 items-center'>
        <p className='min-w-[5rem]'>Phường:</p>
        <Controller
          control={control}
          name='ward'
          defaultValue={userAddress[2]}
          render={({ field: { onChange, value } }) => (
            <select
              className='ml-4 p-1'
              value={value}
              onChange={(e) => {
                onChange(e)
              }}
            >
              <option>Chọn Phường / Xã</option>
              {wards &&
                wards.map((ward) => {
                  return (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  )
                })}
            </select>
          )}
        />
      </div>
    </div>
  )
}
