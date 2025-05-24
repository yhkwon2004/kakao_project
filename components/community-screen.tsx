"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface Post {
  id: string
  title: string
  content: string
}

const CommunityScreen = () => {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem("posts")
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts))
      } else {
        setPosts([]) // 로컬 스토리지에 데이터가 없을 때 빈 상태로 시작
      }
    } catch (error) {
      console.error("Failed to load posts:", error)
    }
  }

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet. Be the first to create one!</Text>
        </View>
      ) : (
        <FlatList data={posts} renderItem={renderItem} keyExtractor={(item) => item.id} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  postContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
})

export default CommunityScreen
