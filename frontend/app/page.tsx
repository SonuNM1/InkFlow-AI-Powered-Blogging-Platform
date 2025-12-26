import { redirect } from 'next/dist/server/api-utils'
import React from 'react'

const Home = () => {
  return redirect("/blogs")
}

export default Home
