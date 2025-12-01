// Game Service Layer
import {
  doc,
  onSnapshot,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { Game, Player, Question } from './types';
export class GameService {
  static subscribeToGame(gameId: string, callback: (game: Game | null) => void) {
    const gameRef = doc(db, 'games', gameId.toUpperCase());
    
    return onSnapshot(
      gameRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const gameData = {
            id: docSnap.id,
            ...docSnap.data(),
          } as Game;
          callback(gameData);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Game subscription error:', error);
        callback(null);
      }
    );
  }
  static async joinTeam(
    gameId: string,
    playerName: string,
    playerId: string,
    teamName: string,
    userId: string
  ): Promise<void> {
    const gameRef = doc(db, 'games', gameId.toUpperCase());
    
    await runTransaction(db, async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game does not exist');
      }
      
      const game = gameDoc.data() as Game;
      
      // Validation
      if (game.status !== 'lobby') {
        throw new Error('Game has already started');
      }
      const existingPlayer = game.teams
        .flatMap(t => t.players)
        .find(p => p.id === userId);
        
      if (existingPlayer) {
        throw new Error('Already joined a team');
      }
      const team = game.teams.find(t => t.name === teamName);
      if (!team) {
        throw new Error('Team not found');
      }
      if (team.players.length >= team.capacity) {
        throw new Error('Team is full');
      }
      const newPlayer: Player = {
        id: userId,
        playerId,
        name: playerName,
        teamName,
        answeredQuestions: [],
        coloringCredits: 0,
        score: 0,
      };
      const updatedTeams = game.teams.map(t => {
        if (t.name === teamName) {
          return { ...t, players: [...t.players, newPlayer] };
        }
        return t;
      });
      
      transaction.update(gameRef, { teams: updatedTeams });
    });
  }

  static async submitAnswer(gameId: string, currentPlayer: Player, question: Question, isCorrect: boolean): Promise<Player> {
    const gameRef = doc(db, 'games', gameId.toUpperCase());
    let newPlayerState: Player | null = null;
    
    await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) throw new Error("Game does not exist!");
        const currentGame = gameDoc.data() as Game;

        const teamIndex = currentGame.teams.findIndex((t) => t.name === currentPlayer.teamName);
        if (teamIndex === -1) throw new Error("Team not found");

        const playerIndex = currentGame.teams[teamIndex].players.findIndex((p) => p.id === currentPlayer.id);
        if (playerIndex === -1) throw new Error("Player not found in team");

        const updatedTeams = [...currentGame.teams];
        const playerToUpdate = { ...updatedTeams[teamIndex].players[playerIndex] };

        playerToUpdate.answeredQuestions = [...(playerToUpdate.answeredQuestions || []), question.question];

        if (isCorrect) {
            updatedTeams[teamIndex].score += 1;
            playerToUpdate.coloringCredits += 1;
            playerToUpdate.score +=1;
        }

        updatedTeams[teamIndex].players[playerIndex] = playerToUpdate;
        transaction.update(gameRef, { teams: updatedTeams });
        newPlayerState = playerToUpdate;
    });

    if (!newPlayerState) {
        throw new Error("Failed to update player state after submitting answer.");
    }
    return newPlayerState;
  }
  
    static async colorSquare(gameId: string, currentPlayer: Player, squareId: number): Promise<void> {
        const gameRef = doc(db, 'games', gameId.toUpperCase());

        await runTransaction(db, async (transaction) => {
            const gameDoc = await transaction.get(gameRef);
            if (!gameDoc.exists()) throw new Error("Game does not exist!");
            
            const currentGame = gameDoc.data() as Game;
            const teamIndex = currentGame.teams.findIndex(t => t.name === currentPlayer.teamName);
            if (teamIndex === -1) return;
            
            const playerIndex = currentGame.teams[teamIndex].players.findIndex(p => p.id === currentPlayer.id);
            if (playerIndex === -1) return;
            
            const updatedTeams = [...currentGame.teams];
            const playerToUpdate = updatedTeams[teamIndex].players[playerIndex];

            if (playerToUpdate.coloringCredits <= 0) throw new Error("No coloring credits left.");

            const gridIndex = currentGame.grid.findIndex(s => s.id === squareId);
            if (gridIndex === -1) throw new Error("Square not found.");
            
            const updatedGrid = [...currentGame.grid];
            if (updatedGrid[gridIndex].coloredBy) {
                // If it's already colored, do nothing for now. Can add steal logic later.
                return; 
            } else {
                updatedGrid[gridIndex].coloredBy = currentGame.sessionType === 'individual' || currentGame.parentSessionId ? playerToUpdate.id : playerToUpdate.teamName;
                playerToUpdate.coloringCredits -= 1;
            }
            
            updatedTeams[teamIndex].players[playerIndex] = playerToUpdate;
            transaction.update(gameRef, { teams: updatedTeams, grid: updatedGrid });
        });
    }
}
