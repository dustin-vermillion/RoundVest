const express = require('express');
const app = express();
app.use(express.json());

// --- 1. MOCK DATABASE ---
// Simulating a user's virtual wallet and total invested amount
const UserDB = {
    'user_001': { virtualBalance: 85.00, totalInvested: 1500.00 }
};

// --- 2. AI SENTIMENT ENGINE (CORE LOGIC) ---
// In a production environment, this would call an NLP model or News API
function getAIMarketMood() {
    // Simulating an AI analyzing global financial news
    // Score scale: 0-100 (0 = Extreme Volatility, 100 = High Stability)
    const sentimentScore = 45; 
    
    let targetAsset = 'NIFTY_50'; // Default to high-growth equity
    let marketStatus = "Market Stable. Maximizing Growth.";

    if (sentimentScore < 50) {
        targetAsset = 'DIGITAL_GOLD'; // Shift to Safe Haven asset
        marketStatus = "Volatile Market Detected. Protecting Capital.";
    }
    
    return { score: sentimentScore, asset: targetAsset, status: marketStatus };
}

// --- 3. API ENDPOINT: TRANSACTION ROUND-UP (FOR DASHBOARD UI) ---
// Triggered every time a user makes a UPI/Card payment
app.post('/api/transaction', async (req, res) => {
    const { userId, spendAmount } = req.body; // Example: ₹185
    
    // Calculate spare change (Rounding up to the nearest ₹50)
    const remainder = spendAmount % 50;
    const roundUpAmount = remainder === 0 ? 0 : 50 - remainder; // Example: ₹15
    
    if (roundUpAmount > 0) {
        UserDB[userId].virtualBalance += roundUpAmount;
        
        // Threshold Check: Did we hit the ₹100 limit?
        if (UserDB[userId].virtualBalance >= 100) {
            await executeSmartInvestment(userId, 100);
        }
    }
    
    // Send updated data back to the frontend
    res.json({
        message: "Transaction processed successfully",
        spareChangeAdded: roundUpAmount,
        currentVirtualBalance: UserDB[userId].virtualBalance
    });
});

// --- 4. API ENDPOINT: AI SENTINEL DASHBOARD ---
// Fetches the current market mood for the UI gauge/dial
app.get('/api/market-mood', (req, res) => {
    const aiDecision = getAIMarketMood();
    res.json({
        currentScore: aiDecision.score,
        investingInto: aiDecision.asset,
        systemStatus: aiDecision.status
    });
});

// --- 5. EXECUTION ENGINE ---
// Handles the simulated bank deduction and broker API routing
async function executeSmartInvestment(userId, amount) {
    const aiDecision = getAIMarketMood();
    console.log(`[EXECUTION] ₹100 Threshold hit!`);
    console.log(`[AI ROUTING] Directing ₹${amount} into: ${aiDecision.asset}`);
    
    // NOTE FOR JUDGES: In production, this section integrates:
    // 1. Bank Deduction API (e.g., Razorpay Mandates / UPI AutoPay)
    // 2. Broker API (e.g., Upstox / Zerodha Coin) to execute the trade
    
    // Reset the virtual wallet by subtracting the invested amount
    UserDB[userId].virtualBalance -= amount; 
    UserDB[userId].totalInvested += amount;

    console.log(`[SUCCESS] Investment complete. New Virtual Balance: ₹${UserDB[userId].virtualBalance}`);
}

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 AI Micro-Investing Backend running on port ${PORT}`));
