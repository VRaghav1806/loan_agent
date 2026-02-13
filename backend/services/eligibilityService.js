/**
 * Service to calculate loan eligibility based on user financial profile
 * @param {Object} userProfile - User's financial data
 * @param {Object} loanCriteria - Loan's eligibility criteria
 * @returns {Object} - Eligibility status and score
 */
const calculateEligibility = (userProfile, loanCriteria) => {
    const details = {
        age: {
            isEligible: userProfile.age >= loanCriteria.minAge && userProfile.age <= loanCriteria.maxAge,
            message: userProfile.age < loanCriteria.minAge
                ? `Minimum age required is ${loanCriteria.minAge}`
                : userProfile.age > loanCriteria.maxAge
                    ? `Maximum age allowed is ${loanCriteria.maxAge}`
                    : 'Age criteria met'
        },
        income: {
            isEligible: userProfile.monthlyIncome >= loanCriteria.minIncome,
            message: userProfile.monthlyIncome < loanCriteria.minIncome
                ? `Minimum monthly income required is ₹${loanCriteria.minIncome.toLocaleString()}`
                : 'Income criteria met'
        },
        creditScore: {
            isEligible: userProfile.creditScore >= loanCriteria.minCreditScore,
            message: userProfile.creditScore < loanCriteria.minCreditScore
                ? `Minimum credit score required is ${loanCriteria.minCreditScore}`
                : 'Credit score is healthy'
        },
        employment: {
            isEligible: !loanCriteria.employmentRequired || (userProfile.employmentStatus === 'employed' || userProfile.employmentStatus === 'self-employed'),
            message: loanCriteria.employmentRequired && !(userProfile.employmentStatus === 'employed' || userProfile.employmentStatus === 'self-employed')
                ? 'Steady employment or self-employment history required'
                : 'Employment status is eligible'
        },
        existingLoans: {
            isEligible: userProfile.existingLoans <= loanCriteria.maxExistingLoans,
            message: userProfile.existingLoans > loanCriteria.maxExistingLoans
                ? `Too many active loans (Maximum ${loanCriteria.maxExistingLoans} allowed)`
                : 'Active loan count is within limits'
        }
    };

    // Calculate complex weighted score
    let score = 0;
    if (details.income.isEligible) score += 40;
    if (details.creditScore.isEligible) score += 30;
    if (details.employment.isEligible) score += 15;
    if (details.age.isEligible) score += 10;
    if (details.existingLoans.isEligible) score += 5;

    // Strict eligibility: Income and Credit Score are non-negotiable
    const isEligible = details.income.isEligible && details.creditScore.isEligible && details.age.isEligible;

    return {
        isEligible,
        score,
        details,
        status: isEligible ? 'Eligible' : 'Not Eligible',
        recommendation: isEligible
            ? 'You have a high chance of approval! Proceed to apply.'
            : 'We recommend improving your financial profile before applying.'
    };
};

module.exports = { calculateEligibility };
