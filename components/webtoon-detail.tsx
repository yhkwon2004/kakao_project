import type React from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface WebtoonDetailProps {
  webtoon: {
    title: string
    investmentHistory?: { date: string; amount: number }[]
  }
}

const WebtoonDetail: React.FC<WebtoonDetailProps> = ({ webtoon }) => {
  const investmentHistory = webtoon.investmentHistory || []

  // 투자자 증가 그래프 데이터 생성
  const investorIncreaseData = () => {
    if (!investmentHistory || investmentHistory.length === 0) {
      return {
        labels: [],
        datasets: [],
      }
    }

    const labels = investmentHistory.map((item) => item.date)
    const data = investmentHistory.map((item) => 1) // 각 투자 내역을 1명의 투자자로 간주
    const cumulativeData: number[] = []
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
      cumulativeData.push(sum)
    }

    return {
      labels: labels,
      datasets: [
        {
          label: "투자자 수",
          data: cumulativeData,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    }
  }

  // 투자금액 증가 그래프 데이터 생성
  const investmentAmountData = () => {
    if (!investmentHistory || investmentHistory.length === 0) {
      return {
        labels: [],
        datasets: [],
      }
    }

    const labels = investmentHistory.map((item) => item.date)
    const data = investmentHistory.map((item) => item.amount)
    const cumulativeData: number[] = []
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
      cumulativeData.push(sum)
    }

    return {
      labels: labels,
      datasets: [
        {
          label: "투자 금액 (원)",
          data: cumulativeData,
          borderColor: "rgb(255, 99, 132)",
          tension: 0.1,
        },
      ],
    }
  }

  const investorIncreaseOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "투자자 증가 추이",
      },
    },
  }

  const investmentAmountOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "투자 금액 증가 추이",
      },
    },
  }

  return (
    <div>
      <h1>{webtoon.title}</h1>
      {investmentHistory && investmentHistory.length > 0 ? (
        <>
          <div>
            <Line options={investorIncreaseOptions} data={investorIncreaseData()} />
          </div>
          <div>
            <Line options={investmentAmountOptions} data={investmentAmountData()} />
          </div>
        </>
      ) : (
        <p>투자 내역이 없습니다.</p>
      )}
    </div>
  )
}

export default WebtoonDetail
