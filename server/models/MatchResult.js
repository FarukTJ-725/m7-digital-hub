const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
    player1Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GamerProfile',
        required: true
    },
    player2Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GamerProfile',
        required: true
    },
    player1Username: {
        type: String,
        required: true,
        trim: true
    },
    player2Username: {
        type: String,
        required: true,
        trim: true
    },
    player1Team: {
        type: String,
        required: true,
        trim: true
    },
    player2Team: {
        type: String,
        required: true,
        trim: true
    },
    player1Score: {
        type: Number,
        required: true,
        min: 0
    },
    player2Score: {
        type: Number,
        required: true,
        min: 0
    },
    gameVersion: {
        type: String,
        enum: ['FC24', 'FC25', 'FC26', 'FC25-RTWC', 'Other'],
        default: 'FC26'
    },
    matchType: {
        type: String,
        enum: ['casual', 'ranked', 'tournament', 'clan-war'],
        default: 'casual'
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        default: null
    },
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GamerProfile',
        default: null
    },
    isDraw: {
        type: Boolean,
        default: false
    },
    matchDuration: {
        type: Number, // in minutes
        default: null
    },
    goals: [{
        scorer: String,
        minute: Number,
        team: String
    }],
    highlights: [{
        type: String, // description of highlight
        minute: Number,
        team: String
    }],
    matchDate: {
        type: Date,
        default: Date.now
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'disputed', 'cancelled'],
        default: 'confirmed'
    }
}, {
    timestamps: true
});

// Calculate winner before saving
matchResultSchema.pre('save', function(next) {
    if (this.player1Score > this.player2Score) {
        this.winnerId = this.player1Id;
        this.isDraw = false;
    } else if (this.player2Score > this.player1Score) {
        this.winnerId = this.player2Id;
        this.isDraw = false;
    } else {
        this.winnerId = null;
        this.isDraw = true;
    }
    next();
});

// Index for efficient queries
matchResultSchema.index({ player1Id: 1, player2Id: 1 });
matchResultSchema.index({ matchDate: -1 });
matchResultSchema.index({ winnerId: 1 });
matchResultSchema.index({ 'player1Username': 'text', 'player2Username': 'text' });

// Static method to get head-to-head
matchResultSchema.statics.getHeadToHead = async function(player1Id, player2Id) {
    const matches = await this.find({
        $or: [
            { player1Id, player2Id },
            { player1Id: player2Id, player2Id: player1Id }
        ],
        status: 'confirmed'
    }).sort({ matchDate: -1 });

    const stats = {
        totalMatches: matches.length,
        player1Wins: matches.filter(m => m.winnerId?.toString() === player1Id.toString()).length,
        player2Wins: matches.filter(m => m.winnerId?.toString() === player2Id.toString()).length,
        draws: matches.filter(m => m.isDraw).length,
        player1Goals: matches.reduce((sum, m) => {
            return m.player1Id.toString() === player1Id.toString() 
                ? sum + m.player1Score + m.player2Score 
                : sum + m.player2Score + m.player1Score;
        }, 0),
        player2Goals: matches.reduce((sum, m) => {
            return m.player1Id.toString() === player2Id.toString() 
                ? sum + m.player1Score + m.player2Score 
                : sum + m.player2Score + m.player1Score;
        }, 0)
    };

    return { matches, stats };
};

// Static method to get recent matches for a player
matchResultSchema.statics.getRecentMatches = async function(gamerId, limit = 10) {
    return this.find({
        $or: [
            { player1Id: gamerId },
            { player2Id: gamerId }
        ],
        status: 'confirmed'
    })
    .sort({ matchDate: -1 })
    .limit(limit)
    .populate('player1Id', 'gamerUsername favoriteTeam')
    .populate('player2Id', 'gamerUsername favoriteTeam');
};

const MatchResult = mongoose.model('MatchResult', matchResultSchema);

module.exports = MatchResult;
