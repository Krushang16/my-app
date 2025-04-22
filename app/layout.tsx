"use client"

import {useState, useEffect  } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar"
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Auth0ProviderWithNavigate from '@/components/auth-provider';
import { getAvailableRewards, getUserByEmail } from '@/utils/db/actions'

const inter = Inter({subsets: ['latin']})

export default function RootLayout({
children,
}:Readonly<{
  children: React.ReactNode;
}>) 
{
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalEarnings, setTotalearnings] = useState(0);



  useEffect(() => {
    const fetchTotalEarnings = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const user = await getUserByEmail(userEmail)
          console.log('user from layout', user);
          
          if (user) {
            const availableRewards = await getAvailableRewards(user.id);
            console.log('availableRewards from layout', availableRewards);
            
            // Calculate total from the array of rewards
            if (Array.isArray(availableRewards)) {
              const total = availableRewards.reduce((sum, reward) => sum + reward.cost, 0);
              setTotalearnings(total);
            } else {
              console.error('Expected availableRewards to be an array');
              setTotalearnings(0);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching total earnings:', error)
      }
    }

    fetchTotalEarnings()
  }, [])
  
  return(
    <html lang='en'>
      <body className={inter.className}>
        <UserProvider>
          <Auth0ProviderWithNavigate>
            <div className='min-h-screen bg-grey-50 flex flex-col'>
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} totalEarnings={totalEarnings} />
              <div className='flex flex-1'>
                <Sidebar open={sidebarOpen}/>
                <main className='flex flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300'>
                  {children}
                </main>  
              </div>  
            </div>
            <Toaster />
          </Auth0ProviderWithNavigate>
        </UserProvider>
      </body>
    </html>
  );
}