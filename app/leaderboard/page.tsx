'use client'
import { useState, useEffect } from 'react'
import { getAllRewards, getUserByEmail } from '@/utils/db/actions'
import { Loader, Award, User, Trophy, Crown } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Define type to match what getAllRewards() actually returns
type DbReward = {
  id: number
  userId: number
  points: number
  createdAt: Date
  userName: string | null
  // No level property here since it's not in the actual data
}

// Our internal Reward type that includes level
type Reward = {
  id: number
  userId: number
  points: number
  level: number
  createdAt: Date
  userName: string | null
  type?: 'earned' | 'redeemed'
}

export default function LeaderboardPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null)

  useEffect(() => {
    const fetchRewardsAndUser = async () => {
      setLoading(true);
      try {
        // Use the DbReward type that matches the actual returned data
        const fetchedRewards: DbReward[] = await getAllRewards();

        // Process rewards to handle earned vs redeemed points
        const userPoints: Record<number, { 
          userId: number, 
          totalPoints: number, 
          level: number, // We'll calculate or default this
          userName: string | null,
          id: number,
          latestDate: Date
        }> = {};

        fetchedRewards.forEach(reward => {
          const rewardDate = new Date(reward.createdAt);
          
          // Initialize user record if not exists
          if (!userPoints[reward.userId]) {
            userPoints[reward.userId] = {
              userId: reward.userId,
              totalPoints: 0,
              level: 1, // Default level to 1 since there's no level in the data
              userName: reward.userName,
              id: reward.id,
              latestDate: rewardDate
            };
          }
          
          // For leaderboard purposes, we only consider positive points
          if (reward.points > 0) {
            userPoints[reward.userId].totalPoints += reward.points;
          }
          
          // Update date if this is a more recent reward
          if (rewardDate > userPoints[reward.userId].latestDate) {
            userPoints[reward.userId].latestDate = rewardDate;
            // Don't update level since it's not in the data
          }
        });

        // Now calculate level based on totalPoints
        Object.values(userPoints).forEach(userPoint => {
          // Simple level calculation: 1 level for every 1000 points, minimum level 1
          userPoint.level = Math.max(1, Math.floor(userPoint.totalPoints / 1000) + 1);
        });

        // Convert to array and sort by points in descending order
        const sortedRewards = Object.values(userPoints)
          .map(user => ({
            id: user.id,
            userId: user.userId,
            points: user.totalPoints,
            level: user.level,
            createdAt: user.latestDate,
            userName: user.userName
          }))
          .sort((a, b) => b.points - a.points);
        
        setRewards(sortedRewards);
        
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail);
          setUser(fetchedUser || null);
        } else {
          toast.error('User not logged in. Please log in.');
        }
      } catch (error) {
        console.error('Error fetching rewards and user:', error);
        toast.error('Failed to load leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRewardsAndUser();
  }, []);
  
  return (
    <div className="">
      <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Leaderboard </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin h-8 w-8 text-gray-600" />
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex justify-between items-center text-white">
                <Trophy className="h-10 w-10" />
                <span className="text-2xl font-bold">Top Performers</span>
                <Award className="h-10 w-10" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward, index) => (
                    <tr key={reward.id} className={`${user && user.id === reward.userId ? 'bg-indigo-50' : ''} hover:bg-gray-50 transition-colors duration-150 ease-in-out`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index < 3 ? (
                            <Crown className={`h-6 w-6 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-600'}`} />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <User className="h-full w-full rounded-full bg-gray-200 text-gray-500 p-2" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reward.userName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-indigo-500 mr-2" />
                          <div className="text-sm font-semibold text-gray-900">{reward.points.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Level {reward.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}