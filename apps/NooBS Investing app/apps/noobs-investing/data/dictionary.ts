export type DictionaryEntry = {
    term: string;
    slickVersion: string;
    noobsTruth: string;
    straightTalk?: string; // The "Human / Common Sense" version
    category: 'Asset' | 'Strategy' | 'Psychology' | 'Market' | 'Acronym' | 'Brand';
    isPro?: boolean; // True for Pro-only entries
};

export const DICTIONARY: DictionaryEntry[] = [
    // --- BRAND & PATH (New: Translating the "Elite" language) ---
    {
        term: "Residency",
        straightTalk: "Guided Investing Program",
        slickVersion: "A rigorous educational immersion designed to build a foundational baseline of wealth-building discipline.",
        noobsTruth: "The 'University' phase. You're training your brain to stop being a noob. You aren't playing with real consequences until you finish this.",
        category: 'Brand'
    },
    {
        term: "Elite Specialization",
        straightTalk: "Advanced Income Strategies",
        slickVersion: "A high-performance track for sophisticated capital allocation and yield-centric harvesting.",
        noobsTruth: "The reward at the finish line. Once you're rich, you stop focusing on making your money grow and start focusing on making it pay your bills.",
        category: 'Brand',
        isPro: true
    },
    {
        term: "Freedom Number",
        straightTalk: "The amount where money stops stressing you",
        slickVersion: "The critical capital threshold at which an individual's asset yield exceeds their total annual liabilities.",
        noobsTruth: "Your 'Quit Your Job' number. Multiply your yearly expenses by 25. Once you hit this, you've won the game. Everything after is just extra credit.",
        category: 'Brand'
    },
    {
        term: "Succession Engine",
        straightTalk: "Your Step-by-Step Path",
        slickVersion: "A logic-driven algorithmic framework for determining optimal sequential wealth-building milestones.",
        noobsTruth: "The 'What do I do now?' button. It looks at your progress and tells you exactly which one thing matters today. No guessing.",
        category: 'Brand'
    },
    {
        term: "The Empire",
        straightTalk: "Your lifetime wealth collection",
        slickVersion: "The aggregate collection of global capital assets and income-generating instruments held across multiple jurisdictions.",
        noobsTruth: "Your stash. The total sum of all your accounts, houses, and investments. It's the scoreboard of your financial life.",
        category: 'Brand'
    },

    // --- ACRONYMS (Free: ROI, YTD) ---
    {
        term: "ATH (All-Time High)",
        slickVersion: "The highest price level that an asset has reached in its history.",
        noobsTruth: "The price where noobs love to buy because 'it's going up!' Usually followed immediately by a drop, causing instant regret. Buying at ATH feels safe but is often expensive.",
        category: 'Acronym',
        isPro: true
    },
    {
        term: "YTD (Year-to-Date)",
        slickVersion: "A period, starting from the beginning of the current year, and continuing up to the present day.",
        noobsTruth: "A short-term scoreboard that doesn't matter. If you're investing for 30 years, who cares what happened in the last 4 months? Stop zooming in.",
        category: 'Acronym'
        // FREE - simple term
    },
    {
        term: "ROI (Return on Investment)",
        slickVersion: "A performance measure used to evaluate the efficiency or profitability of an investment.",
        noobsTruth: "The only number that counts. If this is negative after 5 years, you aren't an investor; you're a philanthropist for Wall Street.",
        category: 'Acronym'
        // FREE - foundational
    },
    {
        term: "P/E Ratio (Price-to-Earnings)",
        slickVersion: "The ratio for valuing a company that measures its current share price relative to its per-share earnings.",
        noobsTruth: "The price tag. A high P/E means you're paying a lot for a dollar of profit (think Tesla). A low P/E means it's on sale (or dying). noobs ignore this and just buy 'vibes'.",
        category: 'Acronym',
        isPro: true
    },
    {
        term: "EPS (Earnings Per Share)",
        slickVersion: "The portion of a company's profit allocated to each outstanding share of common stock.",
        noobsTruth: "The raw fuel of stock prices. If this goes up, the stock usually goes up. If this goes down, the stock crashes. Everything else is just noise.",
        category: 'Acronym',
        isPro: true
    },
    {
        term: "MER (Management Expense Ratio)",
        slickVersion: "The total percentage of a fund's assets used for administrative and other operating expenses.",
        noobsTruth: "The 'Stupidity Tax'. If you pay more than 0.20%, you are getting ripped off. High fees destroy wealth faster than bad markets.",
        category: 'Acronym',
        isPro: true
    },
    {
        term: "IPO (Initial Public Offering)",
        slickVersion: "The process of offering shares of a private corporation to the public in a new stock issuance.",
        noobsTruth: "It stands for 'It's Probably Overpriced'. The insiders are selling their shares to *you* at the highest possible price. Wait 6 months before touching new stocks.",
        category: 'Acronym',
        isPro: true
    },
    {
        term: "FIRE (Financial Independence, Retire Early)",
        slickVersion: "A movement of people dedicated to a program of extreme savings and investment that allows them to retire far earlier than traditional budgets and retirement plans would permit.",
        noobsTruth: "Living like a broke college student for 15 years so you can stop working at 40. It's math, not magic. Save 50%, buy VTI, wait.",
        category: 'Acronym',
        isPro: true
    },
    {
        term: "FUD (Fear, Uncertainty, Doubt)",
        slickVersion: "A disinformation strategy used to influence perception by disseminating negative and dubious or false information.",
        noobsTruth: "Scary headlines designed to make you sell your assets to rich people at a discount. If the news says 'Crypto is Dead' or 'Stocks are Over', it's usually the bottom.",
        category: 'Acronym',
        isPro: true
    },
    {
        term: "HODL (Hold On for Dear Life)",
        slickVersion: "Misspelling of 'hold' that refers to buy-and-hold strategies in the context of bitcoin and other cryptocurrencies.",
        noobsTruth: "A cult chant used by bagholders to stop each other from selling while the ship sinks. In real investing, we just call it 'Long Term Holding'.",
        category: 'Acronym',
        isPro: true
    },

    // --- PSYCHOLOGY (Free: Bagholder) ---
    {
        term: "Bagholder",
        slickVersion: "An investor who holds a position in a security that has decreased in value until it is worthless.",
        noobsTruth: "You bought at the top because of FOMO, it crashed 5 now you're 'holding for the long term' because you're too embarrassed to sell. We've all been there.",
        category: 'Psychology'
        // FREE - common mistake lesson
    },
    {
        term: "Rug Pull",
        slickVersion: "A maneuver where crypto developers abandon a project and run away with investors' funds.",
        noobsTruth: "The creators stole your money. Unlike the stock market, where this is illegal, in crypto/NFTs it's just 'Tuesday'.",
        category: 'Psychology',
        isPro: true
    },
    {
        term: "Paper Hands",
        slickVersion: "An investor who sells at the first sign of trouble.",
        noobsTruth: "Cowards who sell low because they got scared. They fund the profits of the 'Diamond Hands' (or the sensible long-term investors).",
        category: 'Psychology',
        isPro: true
    },
    {
        term: "To The Moon",
        slickVersion: "A phrase used to describe an asset's price rising significantly.",
        noobsTruth: "A delusion. Assets don't go to the moon; they revert to the mean. If you hear this, sell.",
        category: 'Psychology',
        isPro: true
    },
    {
        term: "NooB Tax",
        slickVersion: "The avoidable financial loss incurred by inexperienced investors due to emotional or uneducated decisions.",
        noobsTruth: "The price of being stupid. Includes: buying at the top because of FOMO, selling at the bottom because of panic, paying 2% fees to a 'wealth manager', or listening to your neighbor's 'hot tip'. The market collects this tax every single day.",
        category: 'Psychology'
    },
    {
        term: "Hot Tip",
        slickVersion: "A piece of non-public or highly promising information about a specific investment.",
        noobsTruth: "Garbage. If a tip is 'hot', it's already old. Professionals have already traded it. By the time it reaches you, you're the one paying the professionals their profit. Stick to the index.",
        category: 'Psychology',
        isPro: true
    },

    // --- MARKET (Free: Bear Market) ---
    {
        term: "Bull Trap",
        slickVersion: "A false signal, indicating that a declining trend in a stock or index has reversed and is heading upwards, when, in fact, the security will continue to decline.",
        noobsTruth: "When the market goes up for one day and you think 'It's over! We're rich!' before it immediately crashes another 10%. Don't trust the first bounce.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Dead Cat Bounce",
        slickVersion: "A temporary recovery in share prices after a substantial fall.",
        noobsTruth: "Even a dead cat will bounce if you drop it from high enough. Just because a dying stock goes up 5% doesn't mean it's alive. It's still dead.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Whale",
        slickVersion: "An investor who manages a large amount of capital, such as a hedge fund or high-net-worth individual.",
        noobsTruth: "The people who actually move the market. You are a plankton. Don't try to swim against the whale; just stick to their belly (index funds) and eat the scraps.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Inflation",
        slickVersion: "A general increase in prices and fall in the purchasing value of money.",
        noobsTruth: "A invisible tax that makes your savings worth less every single day. If your money isn't growing faster than inflation, you're getting poorer while standing still.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Market Cap",
        slickVersion: "Total market value of a company's outstanding shares of stock.",
        noobsTruth: "The size of the company. Mega-caps (Apple, Google) are big and boring (good for steady growth). Small-caps are scrappy and move fast (good for excitement and heart attacks).",
        category: 'Market',
        isPro: true
    },
    {
        term: "Volatility",
        slickVersion: "The liability to change rapidly and unpredictably, especially for the worse.",
        noobsTruth: "The 'Price of Admission'. The market zig-zags constantly. If you can't handle a 10% drop without panicking, you haven't paid your emotional dues. It's not a loss unless you press 'Sell'.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Liquidity",
        slickVersion: "The efficiency or ease with which an asset or security can be converted into ready cash without affecting its market price.",
        noobsTruth: "How fast can you sell it? Cash is liquid. A house is not (takes months to sell). Penny stocks are 'illiquid' (nobody wants to buy your trash). Stay liquid enough to survive emergencies.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Correction",
        slickVersion: "A decline of 10% or more in the price of a security from its most recent peak.",
        noobsTruth: "A 10% drop. Normal. Healthy. Happens about once a year. If you panic during a correction, you are doomed. Just keep buying.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Bear Market",
        slickVersion: "A market in which prices are falling, encouraging selling.",
        noobsTruth: "When the market punishes the greedy and the panicked. It's where the real money is made—by the people who have the stomach to keep buying when everything looks red.",
        category: 'Market'
        // FREE - foundational concept
    },
    {
        term: "Bull Market",
        slickVersion: "A market in which share prices are rising, encouraging buying.",
        noobsTruth: "When everyone thinks they're a genius because everything they touch turns to gold. This is when the most dangerous noob habits (like greed and overconfidence) are born.",
        category: 'Market',
        isPro: true
    },

    // --- ASSETS (Free: Bond) ---
    {
        term: "401(k)",
        slickVersion: "A feature of a qualified profit-sharing plan that allows employees to contribute a portion of their wages to individual accounts.",
        noobsTruth: "Free money if your employer matches. If you aren't getting the full match, you are literally rejecting a raise. Max this out before buying stupid NFTs.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "Roth IRA",
        slickVersion: "An individual retirement account allowing a person to set aside after-tax income up to a specified amount each year.",
        noobsTruth: "The Tax-Free Honey Pot. You pay taxes now (while you're poor) so you don't pay taxes later (when you're rich). If you qualify, get one.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "HSA (Health Savings Account)",
        slickVersion: "A tax-advantaged medical savings account available to taxpayers in the United States who are enrolled in a high-deductible health plan.",
        noobsTruth: "Investment account disguised as a medical card. Triple tax advantage. It's the most powerful account in existence if you don't get sick often.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "REIT (Real Estate Investment Trust)",
        slickVersion: "A company that owns, operates, or finances income-generating real estate.",
        noobsTruth: "Being a landlord without fixing toilets. You own a piece of a mall or apartment complex and get paid rent (dividends). Boring but effective.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "Bond",
        slickVersion: "A fixed income instrument that represents a loan made by an investor to a borrower.",
        noobsTruth: "You loaning money to the government. They pay you back with interest. It's boring and won't make you rich, but it won't crash 50% overnight. It's the airbag in your portfolio car.",
        category: 'Asset'
        // FREE - foundational
    },
    {
        term: "Blue Chip Stock",
        slickVersion: "Stock of a huge, well-established, and financially sound company that has operated for many years.",
        noobsTruth: "The grandparents of the market (Coke, Johnson & Johnson). They aren't growing fast, but they aren't going anywhere. Safe, boring, reliable.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "Junk Bond",
        slickVersion: "High-yield, high-risk security, typically issued by a company seeking to raise capital quickly in order to finance a takeover.",
        noobsTruth: "Loaning money to a crackhead. They promise to pay you huge interest, but there's a good chance they just disappear with your cash.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "Dividends",
        slickVersion: "A distribution of profits by a corporation to its shareholders.",
        noobsTruth: "Dividends are NOT 'free money'. The stock price drops by the dividend amount, and the IRS takes a cut. During your Core Residency (Building Phase), dividends are a tax-drag distraction. But in the Elite Specialization (Harvesting Phase), they become your primary tool for funding your life without selling your soul.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "VTI",
        straightTalk: "The 'Everything' US Stock fund",
        slickVersion: "Ticker for the Vanguard Total Stock Market ETF.",
        noobsTruth: "The 'Everything Bagel' of stocks. By buying this, you own a piece of almost every public company in the US. It's boring, cheap, and the NooBS gold standard.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "BND",
        straightTalk: "Total Bond Market fund",
        slickVersion: "Ticker for the Vanguard Total Bond Market ETF.",
        noobsTruth: "The 'Shock Absorber'. Bonds don't grow fast, but they don't drop as hard when stocks crash. It's the medicine that keeps your portfolio stable.",
        category: 'Asset',
        isPro: true
    },
    {
        term: "Crypto",
        straightTalk: "Digital Gambling",
        slickVersion: "A digital currency using cryptography.",
        noobsTruth: "Digital gambling. Produces nothing. Value is based on 'The Greater Fool Theory'. Fun for $50, suicide for your retirement.",
        category: 'Asset',
        isPro: true
    },

    // --- STRATEGY (Free: Diversification) ---
    {
        term: "Catching a Falling Knife",
        slickVersion: "The action of buying an asset which has rapidly declined in price.",
        noobsTruth: "Trying to buy the exact bottom of a crash. You usually lose a few fingers. Wait for the dust to settle before you jump in.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Compound Interest",
        slickVersion: "The addition of interest to the principal sum of a loan or deposit, or in other words, interest on interest.",
        noobsTruth: "The magic snowball and the engine of the Core Residency. At first, it looks like nothing. Ten years later, it's doing more work than you are. The only catch? You have to leave it the hell alone so it can bridge you to the Elite path.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Diversification",
        slickVersion: "The process of allocating capital in a way that reduces the exposure to any one particular asset or risk.",
        noobsTruth: "The Core safety rule: Don't put all your eggs in one basket because you're not a psychic. Even as you enter Elite Specialization, diversification remains your only protection against being 'dead right' but broke.",
        category: 'Strategy'
        // FREE - core concept
    },
    {
        term: "Expense Ratio",
        slickVersion: "A measure of what it costs an investment company to operate a mutual fund or ETF.",
        noobsTruth: "The fee the bank charges you to exist. 1% sounds small, but over 30 years it can steal 30% of your total wealth. Look for 'Low Cost' (0.03% to 0.10%) or prepare to fund your banker's yacht.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Yield",
        slickVersion: "The income return on an investment, such as the interest or dividends received as a percentage.",
        noobsTruth: "The cash-back percentage. A 4% yield means for every $100 you give them, they give you $4 back per year. High yield in the Core path usually means danger. High yield in the Elite path is the whole point—as long as the 'Machine' stays healthy.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "DCA (Dollar Cost Averaging)",
        slickVersion: "An investment strategy in which an investor divides up the total amount to be invested across periodic purchases of a target asset.",
        noobsTruth: "Buying the same amount every month, no matter what. It's the standard operating procedure for the Core Residency. It beats 'Market Timing' 100% of the time because it removes your dumb emotions and automates your journey to the Elite level.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Asset Allocation",
        slickVersion: "An investment strategy that aims to balance risk and reward by apportioning a portfolio's assets.",
        noobsTruth: "Choosing your 'Flavor' of pain. Deciding exactly how much risk (Stocks) vs how much safety (Bonds) you want. Once you set this, your only job is to leave it alone.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Wash Sale",
        slickVersion: "A rule that prohibits an investor from claiming a loss on the sale of an investment if they buy a 'substantially identical' investment within 30 days.",
        noobsTruth: "The Taxman's 'Gotcha!' rule. If you panic sell for a loss and then immediately buy back in because you felt FOMO, you can't use that loss to lower your taxes. The government hates impatience as much as we do.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Margin Call",
        slickVersion: "A broker's demand that an investor deposit additional money or securities so that the account is brought up to the minimum value for trading.",
        noobsTruth: "When the casino calls to collect. You gambled with money you didn't have, the market dropped, and now the bank is selling your stuff to pay themselves back. It's the ultimate 'Game Over' for noobs who play with debt.",
        category: 'Psychology',
        isPro: true
    },
    {
        term: "CapEx (Capital Expenditure)",
        slickVersion: "The money a company spends to buy, maintain, or improve its fixed assets, such as buildings, vehicles, equipment, or land.",
        noobsTruth: "When a company buys a new 'Lambo' (factory or machine) to make more money in the future. It's expensive today, but it's the fuel for growth tomorrow. If CapEx is zero, the company is dying.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Deadweight Loss",
        slickVersion: "The loss of economic efficiency that can occur when equilibrium for a good or service is not achieved or is not achievable.",
        noobsTruth: "Money that simply vanishes into thin air because of inefficiency, taxes, or middle-men. It's the opposite of compound interest. It's the friction that makes you poorer WITHOUT making anyone else richer.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Beta",
        slickVersion: "A measure of a stock's volatility in relation to the overall market.",
        noobsTruth: "The 'Jerkiness' score. A Beta of 2.0 means if the market goes up 1%, the stock jumps 2%. But if the market drops 1%, your stock crashes 2%. High beta is a roller coaster; low beta is a bicycle.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Arbitrage",
        slickVersion: "The simultaneous purchase and sale of an asset to profit from a difference in the price.",
        noobsTruth: "Risk-free profit for the fast and the smart. Finding a nickel on the sidewalk before anyone else does. For noobs, trying this is a great way to lose money to high-frequency trading bots.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Exit Strategy",
        slickVersion: "A plan for how an investor will transition out of an investment.",
        noobsTruth: "Knowing when to walk away BEFORE you start playing. If you don't have an exit strategy, your strategy is eventually 'Panic Selling'. Write it down while you're calm, or you'll regret it when you're scared.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Averaging Down",
        slickVersion: "The process of buying more of an asset as its price drops, lowering the average cost per share.",
        noobsTruth: "Doubling down on your bet. If you believe in the company, it's a 'sale'. If you're just stubborn and don't want to admit you're wrong, it's 'throwing good money after bad'. Choose wisely.",
        category: 'Strategy',
        isPro: true
    },
    {
        term: "Bag",
        slickVersion: "A large position in a specific investment.",
        noobsTruth: "Your heavy lifting. 'Holding a bag' usually means you're stuck with a losing investment that you're too afraid to sell. A 'Bag' is only good if it's filled with VTI.",
        category: 'Psychology',
        isPro: true
    },
    {
        term: "Liquidation",
        slickVersion: "Converting assets into cash, often because a business is closing or an investor needs money quickly.",
        noobsTruth: "The Fire Sale. When you *have* to sell your stuff at whatever price someone is willing to pay because you're broke. It's the saddest part of the market cycle. Avoid this by having an emergency fund.",
        category: 'Market',
        isPro: true
    },
    {
        term: "Solvency",
        slickVersion: "The ability of a company to meet its long-term debts and other financial obligations.",
        noobsTruth: "Not being broke. A company is solvent if they can pay their bills for the next 10 years. In the words of Keynes: 'The market can stay irrational longer than you can stay solvent.' Don't test it.",
        category: 'Market',
        isPro: true
    },
    {
        term: "The 4% Rule",
        slickVersion: "A rule of thumb used to determine the amount of funds an investor can withdraw from their retirement portfolio each year.",
        noobsTruth: "The Ultimate Bridge. Multiply your annual expenses by 25. Once you hit that 'Freedom Number', you've graduated from Core Residency and are ready for the Elite Specialization: Income Harvesting.",
        straightTalk: "The 'Quit' Formula",
        category: 'Strategy',
        isPro: true
    }
];

