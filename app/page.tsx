import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Grades from '@/components/Grades'
import Subjects from '@/components/Subjects'
import Games from '@/components/Games'
import Features from '@/components/Features'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'BrightMinds · Learning made fun',
  description: 'A learning platform for Grade 1 to Grade 10 students',
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Grades />
      <Subjects />
      <Games />
      <Features />
      <Footer />
    </main>
  )
}