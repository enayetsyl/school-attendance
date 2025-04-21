"use client"
import { useGlobalContext } from '@/provider/GlobalContext'
import React from 'react'

const Dashboard = () => {
  const {globalUser} = useGlobalContext()
  console.log(globalUser)
  return (
    <div>Hello {globalUser?.username}</div>
  )
}

export default Dashboard