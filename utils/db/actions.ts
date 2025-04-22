import { db } from "./dbconfig";
import { Notifications, Users, Transactions, CollectedWastes, Reports, Rewards } from "./schema";
import { eq, sql, and, desc, isNull } from "drizzle-orm";

export async function createUser(email: string, name: string) {
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            console.warn(`User with email ${email} already exists.`);
            return existingUser;
        }

        const [user] = await db.insert(Users).values({ email, name }).returning().execute();
        return user;
    } catch (error) {
        console.error("Error creating user", error);
        return null;
    }
}

export async function getUserByEmail(email: string) {
    try {
        const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
        return user;
    } catch (error) {
        console.error("Error fetching user by email", error);
        return null;
    }
}
export async function createNotification(userId: number, message: string, type: string) {
  try {
    const [notification] = await db
      .insert(Notifications)
      .values({ userId, message, type })
      .returning()
      .execute();
    return notification; // ✅ Corrected variable name
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function getUnreadNotifications(userId: number) {
  try {
    return await db.select().from(Notifications).where(
      and(
        eq(Notifications.userId, userId),
        eq(Notifications.isRead, false)
      )
    ).execute();
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}


export async function markNotificationsAsRead(notificationId: number) {
  try {
    return await db
      .update(Notifications)
      .set({ isRead: true }) // Updated to match schema
      .where(eq(Notifications.id, notificationId))
      .execute();
  } catch (error) {
    console.error("Error marking notification as read", error);
    return null;
  }
}

export async function getAllRewards() {
  try {
    // First check if the Rewards table exists and has records
    const rewardsCheck = await db.select({ count: sql`count(*)` }).from(Rewards);
    console.log("Rewards check:", rewardsCheck);
    
    // Make the query more resilient to schema issues
    const rewards = await db
      .select({
        id: Rewards.id,
        userId: Rewards.userId,
        // Only include fields that definitely exist in your schema
        points: Rewards.points || sql`0`,
        // Remove the non-existent level property
        createdAt: Rewards.createdAt,
        // Handle potential null from the join
        userName: Users.name || sql`'Unknown User'`,
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id))
      .orderBy(desc(Rewards.points))
      .execute();

    return rewards;
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    // Log more error details to help diagnose
    console.error("Error details:", JSON.stringify(error, null, 2));
    return [];
  }
}
export async function getRewardTransactions(userId: number) {
  try {
    console.log('Fetching transactions for user ID:', userId)
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    console.log('Raw transactions from database:', transactions)

    const formattedTransactions = transactions.map(t => ({
      ...t,
      date: t.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));

    console.log('Formatted transactions:', formattedTransactions)
    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

/**
 * Calculate the user balance based on reward transactions.
 */



export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  type?: string,
  verificationResult?: any
) {
  try {
    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        amount,
        imageUrl,
        verificationResult,
        status: "pending",
      })
      .returning()
      .execute();

    // Award 10 points for reporting waste
    const pointsEarned = 10;
    await updateRewardPoints(userId, pointsEarned);

    // Create a transaction for the earned points
    await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');

    // Create a notification for the user
    await createNotification(
      userId,
      `You've earned ${pointsEarned} points for reporting waste!`,
      'reward'
    );

    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}


export async function createTransaction(
  userId: number,
  type: "earned_report" | "earned_collect" | "redeemed",
  amount: number,
  description: string
) {
  try {
      const [transaction] = await db
        .insert(Transactions)
        .values({ 
          userId,
          type, 
          amount, 
          description 
        })
        .returning()
        .execute();
      return transaction;
  } catch (error) {
      console.error("Error creating transaction", error);
      throw error;
  }
}

export async function getRecentReports(limit: number = 10) {
    try {
        return await db.select().from(Reports).orderBy(desc(Reports.createdAt)).limit(limit).execute();
    } catch (error) {
        console.error("Error fetching reports", error);
        return [];
    }
}

export async function getWasteCollectionTasks(limit: number = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .limit(limit)
      .execute();

    return tasks.map(task => ({
      ...task,
      date: task.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function getCollectedWastesByCollector(collectorId: number) {
  try {
    return await db.select().from(CollectedWastes).where(eq(CollectedWastes.collectorId, collectorId)).execute();
  } catch (error) {
    console.error("Error fetching collected wastes:", error);
    return [];
  }
}

export async function saveReward(userId: number, amount: number) {
  try {
    const [reward] = await db
      .insert(Rewards)
      .values({
        userId,
        name: 'Waste Collection Reward',
        collectionInfo: 'Points earned from waste collection',
        points: amount,
        level: 1,
        isAvailable: true,
      })
      .returning()
      .execute();
    
    // Create a transaction for this reward
    await createTransaction(userId, 'earned_collect', amount, 'Points earned for collecting waste');

    return reward;
  } catch (error) {
    console.error("Error saving reward:", error);
    throw error;
  }
}

export async function saveCollectedWaste(reportId: number, collectorId: number, verificationResult: any) {
  try {
    // First, verify that the report exists
    const [existingReport] = await db
      .select({ id: Reports.id, status: Reports.status })
      .from(Reports)
      .where(eq(Reports.id, reportId))
      .execute();

    if (!existingReport) {
      throw new Error(`Report with ID ${reportId} does not exist`);
    }

    // Check if the report is already collected or completed
    if (['verified', 'completed'].includes(existingReport.status)) {
      console.warn(`Report ${reportId} is already in ${existingReport.status} status`);
      return null; // Or handle as needed
    }

    // Update the report status to 'verified'
    const [updatedReport] = await db
      .update(Reports)
      .set({ status: 'verified', collectorId })
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();

    // Insert collected waste
    const [collectedWaste] = await db
      .insert(CollectedWaste)
      .values({
        reportId,
        collectorId,
        collectedDate: new Date(),
        status: 'verified',
        verificationResult: verificationResult || null
      })
      .returning()
      .execute();

    // Award points for collecting waste
    const pointsEarned = 10;
    await updateRewardPoints(collectorId, pointsEarned);

    // Create a transaction for the earned points
    await createTransaction(
      collectorId, 
      'earned_collect', 
      pointsEarned, 
      'Points earned for collecting waste'
    );

    // Create a notification for the collector
    await createNotification(
      collectorId,
      `You've earned ${pointsEarned} points for collecting waste!`,
      'reward'
    );

    return collectedWaste;
  } catch (error) {
    console.error("Error saving collected waste:", error);
    throw error;
  }
}



export async function updateTaskStatus(reportId: number, newStatus: string, collectorId?: number) {
  try {
    const updateData: any = { status: newStatus };
    if (collectorId !== undefined) {
      updateData.collectorId = collectorId;
    }
    const [updatedReport] = await db
      .update(Reports)
      .set(updateData)
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}
export async function updateReportStatus(reportId: number, status: string) {
  try {
    const [updatedReport] = await db
      .update(Reports)
      .set({ status })
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating report status:", error);
    return null;
  }
}

// In actions.ts

// First, fix the getOrCreateReward function to ensure it always returns a reward record
export async function getOrCreateReward(userId: number) {
  try {
    // Check if the user has an existing reward
    const [existingReward] = await db
      .select()
      .from(Rewards)
      .where(eq(Rewards.userId, userId))
      .execute();

    if (existingReward) {
      return existingReward;
    }

    // If no reward exists, create one
    const [newReward] = await db
      .insert(Rewards)
      .values({
        userId,
        
        name: "User Reward", // Add a name for consistency
        description: "User reward points", // Add description
        collectionInfo: "Points earned from waste activities",
        level: 1,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .execute();

    return newReward;
  } catch (error) {
    console.error("Error in getOrCreateReward:", error);
    throw error;
  }
}

// Fix updateRewardPoints to create a reward record if it doesn't exist
export async function updateRewardPoints(userId: number, pointsToAdd: number) {
  try {
    // First, ensure the user has a reward record
    const userReward = await getOrCreateReward(userId);
    
    // Now update the points
    const [updatedReward] = await db
      .update(Rewards)
      .set({ 
        points: sql`${Rewards.points} + ${pointsToAdd}`,
        updatedAt: new Date()
      }) 
      .where(eq(Rewards.userId, userId))
      .returning()
      .execute();

    return updatedReward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}

// Fix getAvailableRewards to correctly get user's balance from Rewards table
export async function getAvailableRewards(userId: number) {
  try {
    console.log('Fetching available rewards for user:', userId);
    
    // Get user's reward record (or create if doesn't exist)
    const userReward = await getOrCreateReward(userId);
    const userPoints = userReward ? userReward.points : 0;
    
    console.log('User total points from Rewards table:', userPoints);

    // Get available rewards from the database (excluding user's own reward)
    const dbRewards = await db
      .select({
        id: Rewards.id,
        name: Rewards.name,
        cost: Rewards.points, // Using points as cost for redeemable rewards
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo,
      })
      .from(Rewards)
      .where(
        and(
          eq(Rewards.isAvailable, true),
          sql`${Rewards.userId} != ${userId}` // Exclude the user's own reward
        )
      )
      .execute();

    console.log('Rewards from database:', dbRewards);

    // Combine user points and database rewards
    const allRewards = [
      {
        id: 0, // Use a special ID for user's points
        name: "Your Points",
        cost: userPoints,
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste"
      },
      ...dbRewards
    ];

    console.log('All available rewards:', allRewards);
    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

// Update getUserBalance to use the Rewards table instead of transactions
export async function getUserBalance(userId: number): Promise<number> {
  try {
    const userReward = await getOrCreateReward(userId);
    return userReward ? userReward.points : 0;
  } catch (error) {
    console.error("Error getting user balance:", error);
    return 0;
  }
}
export async function redeemReward(userId: number, rewardId: number) {
  try {
    const userReward = await getOrCreateReward(userId) as any;
    
    if (rewardId === 0) {
      // Redeem all points
      const [updatedReward] = await db.update(Rewards)
        .set({ 
          points: 0,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', userReward.points, `Redeemed all points: ${userReward.points}`);

      return updatedReward;
    } else {
      // Existing logic for redeeming specific rewards
      const availableReward = await db.select().from(Rewards).where(eq(Rewards.id, rewardId)).execute();

      if (!userReward || !availableReward[0] || userReward.points < availableReward[0].points) {
        throw new Error("Insufficient points or invalid reward");
      }

      const [updatedReward] = await db.update(Rewards)
        .set({ 
          points: sql`${Rewards.points} - ${availableReward[0].points}`,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', availableReward[0].points, `Redeemed: ${availableReward[0].name}`);

      return updatedReward;
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
}