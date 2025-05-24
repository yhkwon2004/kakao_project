"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface FavoriteItem {
  id: string
  name: string
}

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites")
      if (storedFavorites) {
        try {
          const parsedFavorites = JSON.parse(storedFavorites)
          if (Array.isArray(parsedFavorites)) {
            setFavorites(parsedFavorites)
          } else {
            console.warn("Stored favorites is not an array. Resetting to empty array.")
            setFavorites([])
          }
        } catch (error) {
          console.error("Error parsing favorites from storage:", error)
          setFavorites([])
        }
      } else {
        setFavorites([])
      }
    } catch (error) {
      console.error("Failed to load favorites:", error)
    }
  }

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <View style={styles.item}>
      <Text>{item.name}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => <Text style={styles.emptyText}>No favorites added yet.</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
})

export default FavoritesScreen
