import { View, Alert, Text } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/services/api'
import { Categories, CategoriesProps } from '@/components/categories'
import { PlaceProps } from '@/components/place'
import { Places } from '@/components/places'
import MapView, { Callout, Marker } from 'react-native-maps'
import { colors, fontFamily } from '@/styles/theme'
import { router } from 'expo-router'

type MarketProps = PlaceProps & {
  latitude: number
  longitude: number
}

const currentLocation = {
  latitude: -23.561187293883442,
  longitude: -46.656451388116494 
}

export default function Home() {
  const [categories, setCategories] = useState<CategoriesProps>([])
  const [category, setCategory] = useState('')
  const [markets, setMarkets] = useState<MarketProps[]>([])
  
  async function fetchCategories() {
    try {
      const { data } = await api.get('/categories')
      setCategories(data)
      setCategory(data[0].id)
    } catch (err) {
      console.log(err)
      Alert.alert('Categorias', 'Não foi possível carregar as categorias.')
    }
  }

  async function fetchMarkets() {
    try {
      if (!category) return

      const {data} = await api.get('/markets/category/' + category)
      setMarkets(data)

    } catch (error) {
      console.log(error)
      Alert.alert('Locais', 'Não foi possível carregar os locais')
    }
  }
  
  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchMarkets()
  }, [category])

  const ref = useRef<MapView>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.animateCamera({
        center: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        zoom: 15,
      })
    } 
  }, [])
  
  return (
    <View style={{ flex: 1, backgroundColor: '#cecece' }}>
      <Categories data={categories} onSelect={setCategory} selected={category} />

      <MapView 
        style={{ flex: 1 }} 
        ref={ref}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
      >
        <Marker
          identifier='current'
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
          }}
          image={require('@/assets/location.png')}
        />
      </MapView>

      {markets.map((market) => (
        <Marker
          key={market.id}
          identifier={market.id}
          coordinate={{
            latitude: market.latitude,
            longitude: market.longitude
          }}
          image={require('@/assets/pin.png')}
        >
          <Callout onPress={() => router.navigate(`/market/${market.id}`)}>
            <View>
              <Text 
                style={{ 
                  fontSize: 14, 
                  color: colors.gray[600], 
                  fontFamily: fontFamily.medium 
                }}
              >
                {market.name}
              </Text>

              <Text 
                style={{ 
                  fontSize: 12, 
                  color: colors.gray[600], 
                  fontFamily: fontFamily.regular 
                }}
              >
                {market.address}
              </Text>
            </View>
          </Callout>
        </Marker>
      ))}

      <Places data={markets} />
    </View>
  )
}