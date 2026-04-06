export type LessonPhase = 'Stability' | 'Math' | 'Practice' | 'Execution' | 'Advanced' | 'Income';

export type LessonSeed = {
    id: string;
    title: string;
    content: string;
    summary: string;
    sortOrder: number;
    phase: LessonPhase;
    question: string;
    correctAnswer: string;
    wrongAnswer: string;
    wrongRationale: string;
    wrongAnswer2: string;
    wrongRationale2: string;
    isPro?: boolean; // True for Advanced lessons (16-20) locked behind paywall
};

export const LESSONS: LessonSeed[] = [
    {
        id: "1",
        sortOrder: 1,
        phase: 'Stability',
        title: "What Investing Actually Is",
        content:
            `Investing isn't a game, it's a process of delayed gratification. Most people treat the stock market like a high-speed slot machine. They want the 'ding-ding-ding' of a winning trade today.\n\n` +
            `**The NooBS Truth:** Real investing is the act of trading your current consumption (buying junk you don't need) for future freedom. It is slow, quiet, and fundamentally boring. If you are looking for a dopamine hit, go to a casino or buy a video game. If your portfolio is exciting, you are almost certainly gambling.\n\n` +
            `**noob mistake:** Checking your account balance every few hours. This is like screaming at a plant to grow faster. It doesn't help the plant, and it gives you a heart attack.`,
        summary: "Investing is boring wealth creation. Excitement is just gambling with a suit on.",
        question: "What's the best sign that you're investing correctly?",
        correctAnswer: "It feels super boring and slow.",
        wrongAnswer: "It's exciting and you check it every hour.",
        wrongRationale: "Wrong. Excitement means you're gambling. Real investing is like watching paint dry. If you're looking for a rush, go to a casino.",
        wrongAnswer2: "You're constantly making 'big moves' based on news.",
        wrongRationale2: "Nope. Big moves based on news is just reacting, not investing. The news is already 'priced in' by the time you see it. You're just chasing shadows."
    },
    {
        id: "2",
        sortOrder: 2,
        phase: 'Stability',
        title: "Why Most People Lose Money",
        content:
            `Markets are efficient, but humans are emotional train wrecks. We are biologically wired to buy when prices are high (because everyone else is happy) and sell when prices are low (because we are terrified).\n\n` +
            `**The NooBS Truth:** The market doesn't steal your money—you give it away through poor behavior. Panic selling during a 'flash crash' or buying a meme stock at the peak of social media hype are the two fastest ways to go broke. Your IQ doesn't matter if your EQ (emotional control) is zero.\n\n` +
            `**noob mistake:** Following the 'Herd'. If your Uber driver and your grandma are both talking about a specific stock, the opportunity has already passed. You're the exit liquidity for the pros.`,
        summary: "The market punishes emotions. Be a robot. Robots don't panic.",
        question: "Why do most people lose money in the market?",
        correctAnswer: "They make decisions based on panic or greed.",
        wrongAnswer: "They aren't smart enough to pick winners.",
        wrongRationale: "Nonsense. Even geniuses go broke when they panic. Your IQ doesn't matter if your EQ (emotional control) is zero. Markets punish emotions.",
        wrongAnswer2: "The market is a rigged game they can't win.",
        wrongRationale2: "Lazy excuse. The market isn't 'rigged' against you personaly; it just doesn't care about you. People lose because they break their own rules, not because of a conspiracy."
    },
    {
        id: "3",
        sortOrder: 3,
        phase: 'Stability',
        title: "Emergency Funds Are Not Optional",
        content:
            `You cannot build a skyscraper on a swamp. If you invest your last $1,000 into the market and your car's transmission fails next week, you will be forced to sell your stocks—likely at a loss—to pay for the repair.\n\n` +
            `**The NooBS Truth:** An emergency fund is the 'Safety Net' that allows you to stay invested during bad times. Without it, you are a fragile investor. Hope is not a strategy. You should have 3-6 months of basic living expenses in a boring savings account before you touch a single stock.\n\n` +
            `**noob mistake:** Thinking of your portfolio as an ATM. It's not. It's a one-way street for the first decade. If you might need the money in the next 12 months, keep it out of the market.`,
        summary: "No cash cushion = high risk of forced selling. Build your wall before you buy your assets.",
        question: "Is it okay to invest your rent money if you're 'sure' it will go up?",
        correctAnswer: "Absolutely not. Never invest money you'll need soon.",
        wrongAnswer: "Yes, as long as it's a 'sure thing'.",
        wrongRationale: "There is no such thing as a 'sure thing'. If you invest rent money and the market dips 5%, you're homeless. That's not investing, it's a disaster waiting to happen.",
        wrongAnswer2: "Only if you use 'stop-loss' orders to protect it.",
        wrongRationale2: "Stop-losses aren't magic. In a fast drop, they might not execute at your price, and you're still liquidated. Rent money stays in the bank, period."
    },
    {
        id: "4",
        sortOrder: 4,
        phase: 'Math',
        title: "Risk Isn't a Vibe",
        content:
            `Risk is the permanent loss of capital. It's not just 'prices going down'—it's the chance that your $100 becomes $0 and never comes back. Many noobs confuse 'Volatility' (prices jumping around) with 'Risk' (going bust).\n\n` +
            `**The NooBS Truth:** You have to pay the 'Volatility Tax' to get long-term returns. If you can't handle a 20% drop without wanting to vomit, your risk is too high. Biology beats math every time. Don't bullsh*t yourself about your own stomach for losses.\n\n` +
            `**noob mistake:** Overestimating your courage. Everyone thinks they are an 'Aggressive' investor when the market is green. Very few remain 'Aggressive' when the screen is blood-red.`,
        summary: "Risk is the chance of losing it all. Volatility is the price of admission. Know the difference.",
        question: "What does 'high risk' actually mean?",
        correctAnswer: "Higher uncertainty and a real chance of losing money.",
        wrongAnswer: "A guarantee of making way more money if you wait.",
        wrongRationale: "Nope. Risk is not a guarantee of anything except uncertainty. High risk means you have a higher chance of your money disappearing. Don't confuse it with 'potential'.",
        wrongAnswer2: "A 'vibe' that you feel when markets are volatile.",
        wrongRationale2: "Risk isn't a feeling in your gut. It's the mathematical reality of permanent capital loss. If you treat it like a 'vibe', you'll get vibes-checked right into bankruptcy."
    },
    {
        id: "5",
        sortOrder: 5,
        phase: 'Math',
        title: "Boring Beats Brilliant",
        content:
            `The financial industry wants you to believe that you need to be a 'Genuis' to succeed. Why? Because then they can charge you high fees to do the 'thinking' for you. The truth is simpler and much harder to execute.\n\n` +
            `**The NooBS Truth:** Compounding doesn't require a high IQ; it requires time and consistency. An average person who invests $200 every month for 30 years will crush a 'Brilliant' person who tries to time the market with $10,000 once a decade and fails.\n\n` +
            `**noob mistake:** Chasing the 'Next Big Thing'. Buying the hottest tech stock or crypto coin might make you feel smart for a week, but the odds of you picking the winner before the pros do are near zero. Stick to the 'Boring' broad-market index funds.`,
        summary: "Intelligence is common. Discipline is rare. Choose discipline.",
        question: "What is the most important trait of a successful investor?",
        correctAnswer: "Consistency (adding money every single month).",
        wrongAnswer: "Brilliance (finding the 'next big thing').",
        wrongRationale: "Wrong. Brilliance is rare and hard to maintain. Consistency is a choice. One big win won't change your life as much as 20 years of small, steady additions.",
        wrongAnswer2: "Luck (being in the right place at the right time).",
        wrongRationale2: "Luck is for gamblers. Investors rely on systems. If you're counting on luck, you're just a NooB with a dream that will eventually turn into a nightmare."
    },

    {
        id: "6",
        sortOrder: 6,
        phase: 'Math',
        title: "Diversification — Not Just a Fancy Word",
        content:
            `Concentration (buying one stock) builds wealth, but diversification (buying many) preserves it. Most noobs think they can pick the next Amazon. The reality is that for every Amazon, there are a thousand Pet.coms that went to zero.\n\n` +
            `**The NooBS Truth:** Diversification is the only 'free lunch' in investing. By owning a broad index fund like [VTI], you own thousands of companies. If one goes bust, you don't even feel it. You are trading the 'dream' of a 1,000% gain for the 'reality' of a solid 7-10% long-term return.\n\n` +
            `**noob mistake:** Mistaking 'More Stocks' for 'Diversification'. Owning 10 different AI stocks isn't diversifying—it's just 10 different ways to lose money if the tech sector dips. True diversification means owning different *kinds* of things.`,
        summary: "Buy the whole stable, not just one horse. It's the only way to avoid the 'Oops, I'm Broke' syndrome.",
        question: "Why should you diversify your portfolio?",
        correctAnswer: "To make sure a single failure doesn't destroy you.",
        wrongAnswer: "To make as much money as possible as fast as possible.",
        wrongRationale: "Incorrect. Diversification actually slows you down a bit, and that's the point. It's insurance against one bad company ruining your whole life.",
        wrongAnswer2: "To show off how many different stocks you own.",
        wrongRationale2: "Diversification isn't a collectors hobby. It's a risk management tool. Owning 50 random stocks isn't diversification if they all do the same thing."
    },
    {
        id: "7",
        sortOrder: 7,
        phase: 'Math',
        title: "Fees Are Stealth Taxes",
        content:
            `A 1% annual fee sounds like a bargain. It's just a penny for every dollar, right? Wrong. Over a 30-year career, a 1% fee can devour up to 25-30% of your *entire* final wealth because that money isn't there to compound.\n\n` +
            `**The NooBS Truth:** You are in a war against [Expense Ratios]. The banks want you to pay for their glass buildings and fancy suits. You should aim for fees under 0.10%. Every dollar you pay in fees is a dollar that isn't working for you. It's a silent leak in your wealth bucket.\n\n` +
            `**noob mistake:** Buying 'Actively Managed' funds with 1.5% fees because the manager looks smart on TV. Historical data shows that 90% of these 'pros' fail to beat a simple, cheap index fund after fees.`,
        summary: "Fees are the silent killers of compounding. Keep your costs near zero or prepare to tip the banker 30% of your life's work.",
        question: "Why should you care about a tiny 1% annual fee?",
        correctAnswer: "It can eat up a huge chunk of your profits over 20+ years.",
        wrongAnswer: "It's small enough to ignore compared to gains.",
        wrongRationale: "Big mistake. That 1% is of your *total* balance, every year. Over decades, it can literally cut your final wealth in half. Fees are the silent killers of compounding.",
        wrongAnswer2: "Because you get better advice if you pay more.",
        wrongRationale2: "Higher fees do NOT equal higher returns. In fact, historical data shows the opposite. Low-cost index funds usually crush expensive 'pro' advice."
    },
    {
        id: "8",
        sortOrder: 8,
        phase: 'Practice',
        title: "Time > Timing",
        content:
            `Timing the market is like trying to catch a falling knife while blindfolded. You might get lucky once, but eventually, you'll lose a finger. Most of the market's gains happen in just a few 'best' days. If you miss them because you were 'waiting for a dip', you lose.\n\n` +
            `**The NooBS Truth:** Time *in* the market is what creates wealth, not the 'perfect' entry price. If you wait for the news to be good, the prices will already be high. If you wait for the news to be bad, you'll be too scared to buy. The solution? Buy every month, no matter what the news says.\n\n` +
            `**noob mistake:** Sitting on a pile of cash waiting for 'The Big Crash'. While you wait, the market often goes up 50%, then 'crashes' 20%. You're still paying more than if you had just bought at the start.`,
        summary: "Market timing is for psychics and liars. For everyone else, just buy and wait.",
        question: "What's the best way to handle a market crash?",
        correctAnswer: "Stay in and keep following your plan.",
        wrongAnswer: "Sell everything and wait for the bottom to buy back.",
        wrongRationale: "You aren't a psychic. You won't time the bottom. Most people who sell low end up buying back high, losing twice. Just stay the course.",
        wrongAnswer2: "Borrow money to double down at the bottom.",
        wrongRationale2: "Leverage during a crash is how people lose their homes. Unless you're a pro, don't play with debt when the house is on fire. Just stick to your plan."
    },
    {
        id: "9",
        sortOrder: 9,
        phase: 'Practice',
        title: "Behavioral Biases",
        content:
            `Your brain was designed to keep you alive on the savannah, not to trade stocks. Evolution taught us that being left behind by the tribe meant death. In the market, that same instinct becomes [FOMO]—the urge to jump into a bubble because everyone else is.\n\n` +
            `**The NooBS Truth:** Your instincts are almost always wrong in finance. When you feel 'safe' because everyone is buying, it's actually the most dangerous time. When you feel 'panicked' because everything is crashing, it's usually the best time to buy. You have to learn to ignore your biology.\n\n` +
            `**noob mistake:** Anchoring. Thinking a stock is 'cheap' just because it was $100 last month and is $50 now. A stock doesn't care what its price *used* to be. It can always go to zero.`,
        summary: "Your brain is a saboteur. Recognize your biases or they will empty your bank account.",
        question: "What is 'FOMO' in the context of investing?",
        correctAnswer: "A dangerous urge to buy because you see others making money.",
        wrongAnswer: "A sophisticated math strategy used by hedge funds.",
        wrongRationale: "Fear Of Missing Out is a primitive instinct, not a strategy. It leads to buying at the peak because 'everyone else is'. That's when you get slaughtered.",
        wrongAnswer2: "A sign that you are 'early' to a great opportunity.",
        wrongRationale2: "If you're feeling FOMO, you're already too late. Hype is the sound of smart money selling to 'early' NooBS. Don't be the exit liquidity."
    },
    {
        id: "10",
        sortOrder: 10,
        phase: 'Practice',
        title: "Avoiding Common Scams",
        content:
            `The financial world is crawling with predators who want your money. They don't wear masks; they wear $3,000 suits and use words like 'Proprietary Algorithm' and 'Guaranteed Minimum Return.'\n\n` +
            `**The NooBS Truth:** If someone is promising you higher returns with zero risk, they are lying. Period. Wealth is built with slow, public, boring assets. This is the final step of your **Core Residency**. You now have the mindset; next, you will build the mechanical skill to bridge over to the Elite Specialization.\n\n` +
            `**noob mistake:** Trusting 'Tips'. Whether it's from a YouTuber or your 'rich' cousin, most tips are just noise. If you can't explain why you're buying it without mentioning someone else's name, you aren't ready to exit the Residency.`,
        summary: "If it sounds too good to be true, you're the one paying for the lie. Trust the process, not the 'gururs'.",
        question: "A friend tells you they have a 'guaranteed 20% weekly' tip. You should:",
        correctAnswer: "Run away. It's a scam or a gamble.",
        wrongAnswer: "Invest a little bit to see if it works.",
        wrongRationale: "Guaranteed 20% weekly would make someone richer than Jeff Bezos in two years. It's a lie. Don't be the sucker who pays for their 'guarantee'.",
        wrongAnswer2: "Ask for their 'track record' and secret sauce.",
        wrongRationale2: "Fake track records are easy to print. The secret sauce is your money. Stop looking for shortcuts and start building a real strategy."
    },

    {
        id: "11",
        sortOrder: 11,
        phase: 'Practice',
        isPro: true,
        title: "Portfolio Templates (No Magic)",
        content:
            `There is no 'Perfect Portfolio' that works for everyone. Some people want maximum growth; others just want to sleep at night. You have to choose your 'flavor' of risk before you start buying.\n\n` +
            `**The NooBS Truth:** Most successful long-term investors use simple, low-cost templates. A 'Balanced' portfolio might be 60% Stocks and 40% Bonds. An 'Aggressive' one might be 100% Stocks. The key isn't getting the percentages 'perfect'—it's picking a plan you can stick to when the market drops 30%. A plan you abandon during a crash is a bad plan.\n\n` +
            `**noob mistake:** Picking the 'Aggressive' template just because it has the highest historical return, then panicking and selling everything during the first 5% dip. Be honest about your own nerves.`,
        summary: "Pick a lane and stay in it. Your ability to stick to the plan is more important than the plan itself.",
        question: "How should you pick an allocation template?",
        correctAnswer: "Based on your real ability to witness your money drop 30% without panicking.",
        wrongAnswer: "Based on which one has the highest theoretical return.",
        wrongRationale: "Theory doesn't matter when you're crying at your screen. If you pick Aggressive but sell when it dips, you've chosen wrong. Be honest with your tolerance.",
        wrongAnswer2: "Based on your age minus 100 or some other old rule.",
        wrongRationale2: "Generic rules don't know you. They don't know your job security or your nerves of steel. Choose based on yourself, not a math formula from 1950."
    },
    {
        id: "12",
        sortOrder: 12,
        phase: 'Practice',
        isPro: true,
        title: "Psychology of Losses",
        content:
            `Losing money doesn't just feel bad—it feels like physical pain. Humans have evolved a trait called 'Loss Aversion,' which means the pain of losing $100 is twice as strong as the joy of gaining $100.\n\n` +
            `**The NooBS Truth:** You have to prepare for the 'Pain' before it happens. If you haven't mentally accepted that your portfolio *will* look red for months (or even years) at some point, you aren't ready to invest. Red days are just the market testing your discipline. If you fail the test by selling, you forfeit your right to the long-term gains.\n\n` +
            `**noob mistake:** Trying to 'Make it Back' quickly. When people lose money, they often take *more* risk to try and 'recover' their losses. This is called 'Revenge Trading' and it's how noobs go from 'down 10%' to 'down 100%'.`,
        summary: "Loss aversion is a biological trap. Expect the pain, accept the pain, and do NOT try to trade your way out of it.",
        question: "Why do we panic more during red days than we celebrate during green days?",
        correctAnswer: "Loss Aversion—our brains are wired to hate losing more than we like winning.",
        wrongAnswer: "Because the market is rigged against us.",
        wrongRationale: "It's not a conspiracy, it's biology. Evolution taught us that losing food was a death sentence, but finding extra was just nice. Now your brain thinks a 5% dip is a saber-toothed tiger.",
        wrongAnswer2: "Because red is a scarier color than green.",
        wrongRationale2: "It's deeper than colors. It's survival hardware in your head. Recognize the instinct, then choose to ignore it. Don't let your inner caveman trade your stocks."
    },
    {
        id: "13",
        sortOrder: 13,
        phase: 'Execution',
        isPro: true,
        title: "Taxes, Dividends, and Reality",
        content:
            `Investing isn't just about 'Gains'—it's about what you keep *after* the government takes their slice. Every time you sell a stock for a profit or receive a dividend, Uncle Sam is standing there with his hand out.\n\n` +
            `**The NooBS Truth:** [Dividends] are not free money. When a company pays a dividend, their stock price usually drops by that exact amount. During your **Core Residency**, you want to avoid 'yield-chasing' because it triggers unnecessary taxes. However, once you reach your freedom number and enter the **Elite Specialization**, you will learn how to strategically use these payouts to fund your life.\n\n` +
            `**noob mistake:** Trading in and out of stocks constantly or chasing high dividends while you're still working. You're voluntarily giving away your compounding power to the IRS. Build the pie first; harvest it later.`,
        summary: "What you keep is more important than what you made. Minimize taxes by holding for years, not days.",
        question: "Are dividends 'free money'?",
        correctAnswer: "No, they usually decrease the stock's price accordingly and are taxable events.",
        wrongAnswer: "Yes, it's just extra cash the company gives you for free.",
        wrongRationale: "Companies don't have a 'magic free money' printer. When they pay a dividend, the company's value goes down by that amount. Plus, the IRS wants a slice immediately. Study up.",
        wrongAnswer2: "Yes, dividends are how companies show they have too much cash.",
        wrongRationale2: "Too much cash is never free. That cash belongs to the shareholders already. Giving it back is just moving it from the company's left pocket to your right pocket—and paying tax on the way."
    },
    {
        id: "14",
        sortOrder: 14,
        phase: 'Execution',
        isPro: true,
        title: "Rebalancing Basics",
        content:
            `If your plan is 60% Stocks and 40% Bonds, and the market has a great year, you might find yourself at 80% Stocks. You are now taking way more risk than you intended. Rebalancing is the act of bringing your portfolio back to your original 'Safety Scale.'\n\n` +
            `**The NooBS Truth:** Rebalancing forces you to do the hardest thing in investing: 'Sell High' (the winners) and 'Buy Low' (the losers). It feels wrong to sell what's working and buy what's 'stagnant,' but that's exactly how you maintain your risk level and harvest gains over time.\n\n` +
            `**noob mistake:** Letting your 'Winners' run until they become 90% of your portfolio. One bad headline for that 'Winner' and your entire life's savings are cut in half. Don't be a fanboy; follow the plan.`,
        summary: "Rebalancing is portfolio maintenance. It keeps your risk on a leash so it doesn't bite you later.",
        question: "Why sell your 'winners' to rebalance?",
        correctAnswer: "To keep your total risk from growing too large.",
        wrongAnswer: "Because those winners are about to crash soon.",
        wrongRationale: "Maybe they crash, maybe they don't—you don't know. But if your 10% risky stock becomes 50% of your portfolio because it went up, your whole life is now dependent on that one risky stock. Trim it to stay safe.",
        wrongAnswer2: "To lock in your profits and buy a lambo.",
        wrongRationale2: "Lambos don't compound. Rebalancing is about maintaining your target risk, not 'taking chips off the table' for toys. Keep the money working according to the plan."
    },
    {
        id: "15",
        sortOrder: 15,
        phase: 'Execution',
        isPro: true,
        title: "Your First Real Contribution",
        content:
            `You've done the reading. You've seen the charts. You've practiced with paper money. But 'Real' money handles differently. Its value is tied to your sweat and hours. Your hands might shake when you hit that first 'Buy' button.\n\n` +
            `**The NooBS Truth:** Your first contribution should be small enough to stay calm, but large enough to care. Don't wait for 'the bottom'. Don't wait for 'certainty'. Certainty is a lie. Create your [Target Allocation], choose your broad ETFs, and just start. The 'perfect' time doesn't exist; the 'rational' time is today.\n\n` +
            `**noob mistake:** Waiting for a 'better' time to start. Over 30 years, the exact day you started doesn't matter. What matters is that you *did* start and that you never stopped.`,
        summary: "Practice is over. Real investing is a marathon of discipline. Hit the button and start walking.",
        question: "When should you make your first real investment?",
        correctAnswer: "When you have a plan, a cash cushion, and can explain what you're buying.",
        wrongAnswer: "As soon as you find a stock that's guaranteed to double.",
        wrongRationale: "We've been over this—nothing is guaranteed. Investing without a plan and a cushion is just jumping out of a plane and hoping you'll find a parachute on the way down.",
        wrongAnswer2: "Immediately, because every day outside the market is a loss.",
        wrongRationale2: "Fear of missing out on 'gains' while you're still confused is the fastest path to actual losses. Get your life stable first, then worry about the market."
    },
    // ========== ADVANCED (PRO ONLY) ==========
    {
        id: "16",
        sortOrder: 16,
        phase: 'Advanced',
        isPro: true,
        title: "Dollar-Cost Averaging (DCA)",
        content:
            `Dollar-Cost Averaging means investing a fixed amount on a regular schedule—regardless of market conditions. When prices are high, you buy fewer shares. When prices are low, you buy more. Over time, this averages out your cost.\n\n` +
            `**The NooBS Truth:** DCA is the opposite of 'Timing the Market.' You don't predict when to buy; you just show up on schedule like a machine. This removes emotion from the equation and guarantees you'll never 'miss the bottom' because you're always buying.\n\n` +
            `**noob mistake:** Trying to 'improve' DCA by waiting for dips. Now you're trying to time within DCA—and you'll never feel like 'now' is the right moment. Set the schedule, trust the math.`,
        summary: "DCA is the robot investor strategy. It buys on autopilot so your emotions never get a vote.",
        question: "What does Dollar-Cost Averaging remove from the equation?",
        correctAnswer: "The need to time the market or make emotional decisions.",
        wrongAnswer: "The need to research what you're buying.",
        wrongRationale: "DCA still requires you to know what you're buying. It just removes the 'when'. Blindly DCAing into garbage is still garbage.",
        wrongAnswer2: "All risk from the investment.",
        wrongRationale2: "DCA smooths out entry risk, it doesn't eliminate market risk. If the entire market tanks for 10 years, DCA won't save you—diversification will."
    },
    {
        id: "17",
        sortOrder: 17,
        phase: 'Advanced',
        isPro: true,
        title: "The 4% Rule for Retirement",
        content:
            `The '4% Rule' suggests that if you withdraw 4% of your portfolio in your first year of retirement, then adjust for inflation each year, you should not run out of money for at least 30 years.\n\n` +
            `**The NooBS Truth:** To live on 4%, you need 25x your annual expenses saved. If you spend $40,000/year, you need $1,000,000 invested. This is the 'Freedom Number' that makes work optional. The math is simple; the discipline to get there is hard.\n\n` +
            `**noob mistake:** Thinking you'll 'just get a part-time job' in retirement. Your body and mind may not cooperate. Plan for true financial freedom; anything else is just hoping for good luck.`,
        summary: "Multiply your expenses by 25 to find your freedom number. That's the mountain you're climbing.",
        question: "What is the core idea behind the 4% Rule?",
        correctAnswer: "Save 25x your annual expenses, withdraw 4% per year adjusted for inflation.",
        wrongAnswer: "Work until 65 and then the government takes care of you.",
        wrongRationale: "Social Security is a supplement, not a plan. Relying solely on it is a one-way ticket to a sad, stressful retirement. Own your freedom.",
        wrongAnswer2: "Withdraw 4% of whatever you have left each year.",
        wrongRationale2: "That's a 'floating' withdrawal, not the 4% Rule. The point is to take a *fixed* real-dollar amount so you can predict your income for 30 years."
    },
    {
        id: "18",
        sortOrder: 18,
        phase: 'Advanced',
        isPro: true,
        title: "Crypto: The NooBS Verdict",
        content:
            `Bitcoin, Ethereum, and friends. Is crypto 'the future' or digital tulips? The honest answer is: Nobody knows. What we *do* know is that crypto is extremely volatile, unregulated, and often manipulated.\n\n` +
            `**The NooBS Truth:** Treat crypto like a spicy lottery ticket, not a retirement fund. If you want to speculate, use money you are 100% willing to lose—typically 1-5% of your total portfolio. Never take loans to buy crypto, never go 'all in', and never trust anyone who promises guaranteed returns.\n\n` +
            `**noob mistake:** Believing 'This time is different' during a crypto mania. History is littered with assets that 'could only go up.' Beanie Babies. Tech stocks in 1999. Housing in 2007. Crypto might win long-term, but in the short-term, it's a casino.`,
        summary: "Crypto is a speculation, not an investment. Bet small, expect to lose it, and you might get lucky.",
        question: "How should a NooBS approach crypto?",
        correctAnswer: "Allocate only what you're 100% willing to lose—typically 1-5% of your portfolio.",
        wrongAnswer: "Go all-in because it's the future of money.",
        wrongRationale: "Putting your life savings into something with 80% drawdowns is not 'believing in the future,' it's reckless gambling disguised as conviction.",
        wrongAnswer2: "Avoid crypto entirely because it's all a scam.",
        wrongRationale2: "Dismissing everything as a scam is as lazy as believing everything is gold. Some crypto has real utility; most doesn't. Study before you bet."
    },
    {
        id: "19",
        sortOrder: 19,
        phase: 'Advanced',
        isPro: true,
        title: "Tax-Advantaged Accounts (401k, IRA, Roth)",
        content:
            `Uncle Sam gives you a 'cheat code' to pay less taxes—but only if you use special accounts. A 401(k), Traditional IRA, and Roth IRA all offer tax advantages that can add hundreds of thousands of dollars to your retirement.\n\n` +
            `**The NooBS Truth:** A 401(k) with employer matching is literally 'free money.' If your employer matches 50% of your contribution up to 6% of your salary, contribute at least 6%. Refusing this is like declining a 50% instant return. Roth accounts grow tax-FREE forever—ideal for young people in low tax brackets.\n\n` +
            `**noob mistake:** Ignoring your 401(k) because you 'want access to your money.' Early withdrawal has brutal penalties. The point is you *shouldn't* touch it. Let it compound for decades.`,
        summary: "Tax-advantaged accounts are your biggest legal edge. Max them out before investing in a taxable brokerage.",
        question: "Why is a 401(k) employer match called 'free money'?",
        correctAnswer: "Because your employer adds money on top of what you contribute—an instant 50-100% return.",
        wrongAnswer: "Because the government pays you back later.",
        wrongRationale: "The government doesn't 'pay you back' for anything. The free money comes from your *employer*, not the IRS. It's a benefit you're leaving on the table.",
        wrongAnswer2: "Because you never have to pay taxes on it.",
        wrongRationale2: "Traditional 401(k)s are tax-deferred, not tax-free. You'll pay taxes when you withdraw in retirement. The 'free money' is the employer match, not a tax loophole."
    },
    {
        id: "20",
        sortOrder: 20,
        phase: 'Advanced',
        isPro: true,
        title: "Building Your Personal Finance Firewall",
        content:
            `Investing is only one layer of your financial fortress. The full stack includes: Income → Emergency Fund → Debt Payoff → Tax-Advantaged Investing → Taxable Brokerage → Alternative Assets (real estate, crypto).\n\n` +
            `**The NooBS Truth:** You don't 'upgrade' by jumping layers. You beat Level 1 (Emergency Fund) before Level 2 (Debt). You fill your 401k/Roth before a taxable account because tax savings compound. This firewall is your 'Passport'—you cannot cross the bridge into the **Elite Specialization** until the firewall is solid.\n\n` +
            `**noob mistake:** Skipping the boring steps. Investing in Bitcoin while carrying 20% APR credit card debt is like setting fire to one side of your house while painting the other. Fix the leak before you try to harvest.`,
        summary: "Your financial life is a game with levels. Beat them in order, or each step gets harder.",
        question: "In what order should you build your financial foundation?",
        correctAnswer: "Emergency Fund → Kill High-Interest Debt → Max Tax-Advantaged Accounts → Taxable Investing.",
        wrongAnswer: "Start investing immediately, then pay off debt with profits.",
        wrongRationale: "You can't reliably beat 20% debt with market returns. Math doesn't care about your optimism. The guaranteed return of paying off debt almost always wins first.",
        wrongAnswer2: "It doesn't matter, just save money somewhere.",
        wrongRationale2: "The wrong order costs you real dollars. $1,000 in a 401(k) beats $1,000 taxable because the tax savings compound too. Sequence is strategy."
    },
    // ========== INCOME (PRO ONLY) ==========
    {
        id: "21",
        sortOrder: 21,
        phase: 'Income',
        isPro: true,
        title: "Yield vs Total Return",
        content:
            `Most people love the idea of 'passive income.' They see a stock paying a 5% dividend and think, 'Free money!' But as we learned earlier, dividends aren't free. They are just a forced withdrawal from the company's value.\n\n` +
            `**The NooBS Truth:** Your wealth is measured by **Total Return** (Price Gain + Dividends). If a stock pays you $10 but drops $10 in value, you didn't 'make money'—you just converted an asset into cash and triggered a tax bill. This lesson is the 'Bridge': Transitioning from the building mindset (Core) to the harvesting mindset (Elite) requires knowing exactly when to switch metrics.\n\n` +
            `**noob mistake:** Chasing dividends while ignoring price drops during the building phase. If you haven't reached your 'Freedom Number' yet, yield is just a distraction from total growth.`,
        summary: "Dividends aren't free money. Total Return is the only metric that puts food on the table.",
        question: "Why should you care about Total Return more than Yield?",
        correctAnswer: "Because a high yield doesn't matter if the stock price is crashing.",
        wrongAnswer: "Yield is more important for monthly bills.",
        wrongRationale: "Monthly bills don't matter if your principal is disappearing. A 10% yield on a stock that drops 50% leaves you with less money than you started with.",
        wrongAnswer2: "Dividends are guaranteed, price gains aren't.",
        wrongRationale2: "Dividends are NOT guaranteed. Companies can (and do) cut them at any time. Basing your life on 'guaranteed' yield is a NooB mistake."
    },
    {
        id: "22",
        sortOrder: 22,
        phase: 'Income',
        isPro: true,
        title: "REITs: The Monthly Income Machine",
        content:
            `Real Estate Investment Trusts (REITs) are companies that own and manage physical properties—malls, apartments, data centers. By law, they must pay out 90% of their taxable income to shareholders.\n\n` +
            `**The NooBS Truth:** REITs are a valid way to get exposure to real estate without being a landlord. Many REITs pay dividends **monthly**, providing a steady 'mental win.' However, they are highly sensitive to interest rates. When rates go up, REITs usually go down. They are not a bond; they are a risky asset.\n\n` +
            `**noob mistake:** Buying REITs because you 'understand real estate.' Most people don't understand REIT debt structures or tenant risks. Don't go 100% into property just because it feels 'real'.`,
        summary: "REITs are convenient but sensitive to rates. They give you monthly cash, but they can drop fast.",
        question: "What's the main legal requirement for a REIT?",
        correctAnswer: "They must pay out 90% of taxable income as dividends.",
        wrongAnswer: "They must only own luxury apartments.",
        wrongRationale: "REITs can own anything from cell towers to timberland. The requirement is about payout, not property type.",
        wrongAnswer2: "They are guaranteed to never lose value.",
        wrongRationale2: "REITs can crash just like any other stock. In fact, when interest rates rise, REITs often crash harder as their debt becomes more expensive."
    },
    {
        id: "23",
        sortOrder: 23,
        phase: 'Income',
        isPro: true,
        title: "Yield Traps (The Siren Song)",
        content:
            `You see a fund or stock promising a 15% or 20% annual yield. Your brain screams: 'JACKPOT!' If I put $100k in, I get $20k a year for doing nothing! Stop. Breathe. Think.\n\n` +
            `**The NooBS Truth:** In the market, if something is paying 15%, it's because the market thinks the company is about to die or the 'income' is unsustainable. This is a **Yield Trap.** You buy for the dividend, the company cuts the payout, the stock crashes 50%, and you're left holding a bag of nothing.\n\n` +
            `**noob mistake:** Expecting the 'market' to be stupid. High yield = high risk. If it was safe, everyone would buy it until the price rose and the yield dropped to a sane level. You aren't smarter than a million algorithms.`,
        summary: "If the yield is over 10%, it's almost always a red flag. The market isn't giving away free money.",
        question: "Why does a stock usually have an extremely high yield (e.g. 15%+)?",
        correctAnswer: "Its price has crashed because investors expect disaster.",
        wrongAnswer: "The company is being extremely generous to NooBS.",
        wrongRationale: "Companies aren't charities. High yield is a warning sign of distress, not a gift.",
        wrongAnswer2: "It's a secret 'cheat code' discovererd by YouTubers.",
        wrongRationale2: "If there was a cheat code, hedge funds would have used it with $10 billion already. High yield is the sound of a company screaming for help."
    },
    {
        id: "24",
        sortOrder: 24,
        phase: 'Income',
        isPro: true,
        title: "Strategic Harvesting",
        content:
            `When you finally reach your **Freedom Number**, you have to start selling. This is the 'Harvest.' But how do you do it without killing the Golden Goose? \n\n` +
            `**The NooBS Truth:** Passive income shouldn't just be about dividends. It's often better to sell a small piece of a growing ETF (like VOO) than to buy a high-yield trap. Selling 1% of your portfolio every quarter is effectively 'creating your own dividend.' This allows you to stay in high-quality assets while getting the cash you need.\n\n` +
            `**noob mistake:** Only ever spending the dividends. If your dividends are 2% but you need 4% to live, you'll be tempted to chase riskier yields. Just sell some of your winners. That's why they are there!`,
        summary: "Harvesting is a mix of dividends and selling shares. Don't be afraid to sell winners to fund your life.",
        question: "What's a safer way to get income than chasing high yield?",
        correctAnswer: "Selling small portions of high-quality growth assets.",
        wrongAnswer: "Borrowing money against your stocks to avoid selling.",
        wrongRationale: "Borrowing against your stocks (margin) is how you get liquidated during a market correction. Selling assets you own is much safer.",
        wrongAnswer2: "Moving 100% of your money into 10% yield speculative coins.",
        wrongRationale2: "This is a recipe for disaster. One bad week and your 'income' is 0. Stay in quality, harvest slowly."
    },
    {
        id: "25",
        sortOrder: 25,
        phase: 'Income',
        isPro: true,
        title: "The Tax Reality of Income",
        content:
            `In many countries, taking 'Income' today is the most expensive way to move money. Dividends are often taxed immediately, whereas price gains are only taxed when you choose to sell.\n\n` +
            `**The NooBS Truth:** When an asset grows in value but you don't sell it, you have an 'Unrealized Gain.' You are effectively getting an interest-free loan from the government for the amount you would have paid in tax. When you chase 'Income' (Dividends), you are forced to pay tax every single year. This kills your compounding speed.\n\n` +
            `**noob mistake:** Wanting 'Income' while you are still working a full-time job. You're just adding to your tax bill for no reason. Grow the pie first; harvest it when you actually quit your job.`,
        summary: "Income is taxable. Growth is deferred. Don't trigger the tax man until you absolutey have to.",
        question: "Why is 'Growth' more tax-efficient than 'Income'?",
        correctAnswer: "You only pay tax when you sell, allowing the tax-money to compound.",
        wrongAnswer: "The government doesn't know about growth gains.",
        wrongRationale: "They definitely know. They just wait to collect. By waiting, you're using their money to make more money for yourself. That's the secret of compound growth.",
        wrongAnswer2: "Growth assets are legally tax-free objects.",
        wrongRationale2: "Nothing is tax-free unless it's in a Roth-style account. But GROWTH is tax-deferred, which is the next best thing. Don't pay today what you can pay in 20 years."
    }
];

export const isLessonPro = (id: string) => LESSONS.find(l => l.id === id)?.isPro || false;


