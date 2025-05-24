"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface Investment {
  id: string
  date: string
  amount: number
  projectName: string
}

const AssetScreen = () => {
  const [completedProjects, setCompletedProjects] = useState<string[]>([])
  const [investmentData, setInvestmentData] = useState<Investment[]>([])

  useEffect(() => {
    loadCompletedProjects()
    loadInvestmentData()
  }, [])

  const loadCompletedProjects = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem("completedProjects")
      if (storedProjects) {
        setCompletedProjects(JSON.parse(storedProjects))
      } else {
        initializeCompletedProjects()
      }
    } catch (error) {
      console.error("Failed to load completed projects:", error)
    }
  }

  const initializeCompletedProjects = async () => {
    // Remove dummy data initialization
    setCompletedProjects([])
  }

  const loadInvestmentData = async () => {
    try {
      const storedInvestmentData = await AsyncStorage.getItem("investmentData")
      if (storedInvestmentData) {
        try {
          setInvestmentData(JSON.parse(storedInvestmentData))
        } catch (parseError) {
          console.error("Error parsing investment data:", parseError)
          setInvestmentData([]) // Set to empty array in case of parsing error
        }
      } else {
        setInvestmentData([]) // Return empty array if no data exists
      }
    } catch (error) {
      console.error("Failed to load investment data:", error)
    }
  }

  const totalInvested = investmentData.reduce((sum, investment) => sum + investment.amount, 0)
  const numberOfInvestments = investmentData.length

  const chartData = {
    labels: investmentData.map((item) => item.date),
    datasets: [
      {
        data: investmentData.map((item) => item.amount),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  const screenWidth = Dimensions.get("window").width

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>자산 현황</Text>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>투자 요약</Text>
        <Text style={styles.summaryText}>총 투자 금액: {totalInvested || 0} 원</Text>
        <Text style={styles.summaryText}>총 투자 횟수: {numberOfInvestments || 0} 회</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>투자 추이</Text>
        {investmentData.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel="₩"
            yAxisSuffix="원"
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <Text>투자 데이터가 없습니다.</Text>
        )}
      </View>

      <View style={styles.projectListContainer}>
        <Text style={styles.projectListTitle}>완료된 프로젝트</Text>
        {completedProjects.length > 0 ? (
          completedProjects.map((project, index) => (
            <Text key={index} style={styles.projectItem}>
              {project}
            </Text>
          ))
        ) : (
          <Text>완료된 프로젝트가 없습니다.</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  chartContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  projectListContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  projectItem: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
})

export default AssetScreen
