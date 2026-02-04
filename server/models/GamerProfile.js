const mongoose = require('mongoose');

const gamerStatsSchema = new mongoose.Schema({
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    goalsScored: { type: Number, default: 0 },
    goalsConceded: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 }
}, { _id: false });

const gamerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    gamerUsername: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    favoriteTeam: {
        type: String,
        enum: [
            'Real Madrid', 'Barcelona', 'Man City', 'Liverpool', 
            'Bayern', 'PSG', 'Juventus', 'Inter', 'Chelsea', 
            'Man Utd', 'Arsenal', 'Tottenham', 'AC Milan', 
            'Napoli', 'Dortmund', 'Ajax', 'Porto', 'Benfica',
            'Other'
        ],
        default: 'Other'
    },
    gamingStyle: {
        type: String,
        enum: ['Attacking', 'Defensive', 'Balanced', 'Counter-Attack'],
        default: 'Balanced'
    },
    preferredPosition: {
        type: String,
        enum: ['ST', 'RW', 'LW', 'CAM', 'CM', 'CDM', 'CB', 'LB', 'RB', 'GK', 'Any'],
        default: 'Any'
    },
    stats: {
        type: gamerStatsSchema,
        default: () => ({
            wins: 0,
            losses: 0,
            draws: 0,
            matchesPlayed: 0,
            goalsScored: 0,
            goalsConceded: 0,
            currentStreak: 0,
            longestStreak: 0,
            winRate: 0
        })
    },
    achievements: [{
        name: String,
        description: String,
        earnedAt: { type: Date, default: Date.now }
    }],
    badges: [{
        type: String,
        earnedAt: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    lastMatchDate: { type: Date, default: null }
}, {
    timestamps: true
});

// Calculate win rate before saving
gamerProfileSchema.pre('save', function(next) {
    if (this.stats.matchesPlayed > 0) {
        const wins = this.stats.wins + (this.stats.draws * 0.5);
        this.stats.winRate = Math.round((wins / this.stats.matchesPlayed) * 100);
    } else {
        this.stats.winRate = 0;
    }
    next();
});

// Static method to update stats
gamerProfileSchema.statics.updateStats = async function(profileId, matchResult) {
    const profile = await this.findById(profileId);
    if (!profile) return null;

    profile.lastMatchDate = new Date();
    
    if (matchResult.winnerId) {
        if (matchResult.winnerId.toString() === profileId.toString()) {
            profile.stats.wins += 1;
            profile.stats.currentStreak += 1;
            if (profile.stats.currentStreak > profile.stats.longestStreak) {
                profile.stats.longestStreak = profile.stats.currentStreak;
            }
        } else {
            profile.stats.losses += 1;
            profile.stats.currentStreak = 0;
        }
    } else {
        profile.stats.draws += 1;
        profile.stats.currentStreak = 0;
    }
    
    profile.stats.matchesPlayed += 1;
    
    if (profileId.toString() === matchResult.player1Id.toString()) {
        profile.stats.goalsScored += matchResult.player1Score;
        profile.stats.goalsConceded += matchResult.player2Score;
    } else {
        profile.stats.goalsScored += matchResult.player2Score;
        profile.stats.goalsConceded += matchResult.player1Score;
    }
    
    await profile.save();
    return profile;
  }

// Virtual for goal difference
gamerProfileSchema.virtual('goalDifference').get(function() {
    return this.stats.goalsScored - this.stats.goalsConceded;
});

// Ensure virtuals are serialized
gamerProfileSchema.set('toJSON', { virtuals: true });
gamerProfileSchema.set('toObject', { virtuals: true });

const GamerProfile = mongoose.model('GamerProfile', gamerProfileSchema);

module.exports = GamerProfile;
