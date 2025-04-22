"use client"

import {useState, useEffect} from "react";
import Link from "next/link";

import {Button} from "./ui/button";
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { useUser } from '@auth0/nextjs-auth0/client';

import {
    createUser,
    getUnreadNotifications,
    getUserByEmail,
    markNotificationsAsRead,
    getUserBalance
} from "@/utils/db/actions";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface HeaderProps {
    onMenuClick: () => void;
    totalEarnings?: number;
}

interface Notification {
    id: number;
    type: string;
    message: string;
}

interface UserInfo {
    email?: string;
    name?: string;
    [key: string]: string | number | boolean | null | undefined;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, isLoading } = useUser();
    const isAuthenticated = !!user;

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [balance, setBalance] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");
    
    console.log('user info', isAuthenticated);
    
    useEffect(() => {
        if (isAuthenticated && user) {
            setUserInfo(user as UserInfo);
            
            if (user.email) {
                const email = user.email; // Store it in a local variable
                localStorage.setItem('userEmail', email);
                
                const syncUser = async () => {
                    try {
                        await createUser(email, user.name || 'Anonymous User');
                    } catch (error) {
                        console.error('Error creating user', error);
                    }
                };
                
                syncUser();
            }
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (userInfo && userInfo.email) {
                const user = await getUserByEmail(userInfo.email);
                if (user) {
                    const unreadNotifications = await getUnreadNotifications(user.id);
                    setNotifications(unreadNotifications);
                }
            }
        };
        
        if (isAuthenticated) {
            fetchNotifications();
            const notificationsInterval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(notificationsInterval);
        }
    }, [userInfo, isAuthenticated]);

    useEffect(() => {
        const fetchUserBalance = async () => {
            if (userInfo && userInfo.email) {
                const user = await getUserByEmail(userInfo.email);
                
                if (user) {
                    const userBalance = await getUserBalance(user.id);
                    setBalance(userBalance);
                }
            }
        };
        
        if (isAuthenticated) {
            fetchUserBalance();

            const handleBalanceUpdate = (event: CustomEvent) => {
                setBalance(event.detail);
            };
            
            window.addEventListener('balanceUpdate', handleBalanceUpdate as EventListener);

            return () => {
                window.removeEventListener('balanceUpdate', handleBalanceUpdate as EventListener);
            };
        }
    }, [userInfo, isAuthenticated]);

    const handleNotificationClick = async (notificationId: number) => {
        await markNotificationsAsRead(notificationId);
        // Refresh notifications after marking as read
        if (userInfo && userInfo.email) {
            const user = await getUserByEmail(userInfo.email);
            if (user) {
                const unreadNotifications = await getUnreadNotifications(user.id);
                setNotifications(unreadNotifications);
            }
        }
    };

    if (isLoading) {
        return <div>Loading authentication...</div>;
    }
   
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center">
                    <Button variant='ghost' 
                        size='icon'
                        className="mr-2 md:mr-4" 
                        onClick={onMenuClick}>
                        <Menu className="h-6 w-6 text-gray-800" />
                    </Button> 
                    <Link href="/" className="flex items-center">
                        <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
                        <span className="font-bold text-base md:text-lg text-gray-800">
                            Real Waste Managment 
                        </span> 
                    </Link>
                </div>  
                {!isMobile && (
                    <div className="flex-1 max-w-xl mx-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>
                )}
                <div className="flex items-center">
                    {isMobile && (
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Search className="h-5 w-5" />
                        </Button>    
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className="mr-2 relative">
                                <Bell className="h-5 w-5 text-gray-800"/>
                                {notifications.length > 0 && (
                                    <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                                        {notifications.length}
                                    </Badge>
                                )}
                            </Button>   
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <DropdownMenuItem 
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{notification.type}</span>
                                            <span className="text-sm text-gray-500">{notification.message}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <DropdownMenuItem>No new notifications</DropdownMenuItem>
                            )}
                        </DropdownMenuContent> 
                    </DropdownMenu>
                    <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
                        <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
                        <span className="font-semibold text-sm md:text-base text-gray-800">
                            {balance.toFixed(2)}
                        </span>
                    </div>
                    
                    
                    {!isAuthenticated ? (
                      <a 
                      href="/api/auth/login" 
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center"
                      >
                        Login
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 ml-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M14 5l7 7m0 0l-7 7m7-7H3" 
                          />
                        </svg>
                      </a>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="flex items-center">
                            <User className="h-5 w-5 mr-1" />
                            <span className="hidden md:inline mr-1">{userInfo?.name?.split(' ')[0] || 'User'}</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href="/profile" className="w-full">Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href="/setting" className="w-full">Settings</Link>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem>
                            <a href="/api/auth/logout" className="w-full">Logout</a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </div>
            </div>      
        </header>
    );
}