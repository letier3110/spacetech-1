// src/DonutChart.js
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LayoutPosition, TooltipItem } from 'chart.js'
import { FC } from 'react'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DonutChartProps {
  labels: string[]
  dataValues: number[]
}

const DonutChart: FC<DonutChartProps> = ({ labels, dataValues }) => {
  const data = {
    labels,
    datasets: [
      {
        label: '# of Votes',
        data: dataValues,
        backgroundColor: [`hsl(${120}, 50%, 50%)`, `hsl(${60}, 75%, 75%)`, `hsl(${0}, 50%, 50%)`],
        borderColor: [`hsl(${120}, 50%, 50%)`, `hsl(${60}, 75%, 75%)`, `hsl(${0}, 50%, 50%)`],
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: false,
    plugins: {
      legend: {
        position: 'top' as LayoutPosition
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"doughnut">) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`
          }
        }
      }
    }
  }

  return <Doughnut data={data} options={options} />
}

export default DonutChart
