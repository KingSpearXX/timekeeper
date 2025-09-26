// Helper function to get authentication token from either storage location
const getAuthToken = () => {
  return (
    localStorage.getItem("directus_token") ||
    sessionStorage.getItem("directus_token")
  );
};

export const walletService = {
  // Get user's wallet logs with pagination
  async getUserWalletLogs(userId, page = 1, limit = 10) {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const offset = (page - 1) * limit;
      const baseUrl =
        import.meta.env.VITE_DIRECTUS_URL || "http://localhost:8055";
      const url = `${baseUrl}/items/wallet_log?filter[employee_id][_eq]=${userId}&sort=-date_created&limit=${limit}&offset=${offset}&meta=total_count`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Wallet logs fetch failed:",
          response.status,
          response.statusText
        );
        throw new Error(`Failed to fetch wallet logs: ${response.status}`);
      }

      const data = await response.json();

      return {
        data: data.data || [],
        totalCount: data.meta?.total_count || 0,
      };
    } catch (error) {
      console.error("Error fetching wallet logs:", error);
      throw new Error("Failed to fetch wallet logs");
    }
  },

  // Get user's current wallet balance from employee profile
  async getUserWalletBalance(userId) {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const baseUrl =
        import.meta.env.VITE_DIRECTUS_URL || "http://localhost:8055";
      const url = `${baseUrl}/items/employee_profile?filter[employee_profile_id][_eq]=${userId}&fields=wallet,id`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Wallet balance fetch failed:",
          response.status,
          response.statusText
        );
        throw new Error(`Failed to fetch wallet balance: ${response.status}`);
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        return {
          balance: data.data[0].wallet || 0,
          profileId: data.data[0].id,
        };
      } else {
        return {
          balance: 0,
          profileId: null,
        };
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      throw new Error("Failed to fetch wallet balance");
    }
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  },

  // Format date for wallet logs
  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return "Today";
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  },

  // Format time
  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  },

  // Get transaction type display info
  getTransactionTypeInfo(type) {
    const types = {
      earning: {
        label: "Earning",
        class: "earning",
        icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
      },
      withdrawal: {
        label: "Withdrawal",
        class: "withdrawal",
        icon: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
      },
      adjustment: {
        label: "Adjustment",
        class: "adjustment",
        icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
      },
    };

    return (
      types[type] || {
        label: type,
        class: "other",
        icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
      }
    );
  },

  // Validate withdraw amount
  validateWithdrawAmount(amount, currentBalance) {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, message: "Please enter a valid amount" };
    }

    if (numAmount > currentBalance) {
      return { valid: false, message: "Insufficient balance" };
    }

    return { valid: true, message: "" };
  },

  // Create a withdrawal record in wallet_log
  async createWithdrawal(userId, amount, type = "ewallet") {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const baseUrl =
        import.meta.env.VITE_DIRECTUS_URL || "http://localhost:8055";
      const url = `${baseUrl}/items/wallet_log`;

      // Create withdrawal record with negative amount
      const withdrawalData = {
        employee_id: userId,
        remarks: "withdrawal - " + type.toUpperCase(),
        wallet_value: -Math.abs(parseFloat(amount)), // Ensure negative value
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withdrawalData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Withdrawal creation failed:",
          response.status,
          response.statusText
        );
        throw new Error(`Failed to create withdrawal: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      throw new Error("Failed to create withdrawal record");
    }
  },
};
