// 孕娘王者 - 战斗系统
// Battle System: Rock-Paper-Scissors Combat Logic

class Battle {
    constructor(playerCharacter, enemyCharacter) {
        this.player = playerCharacter;
        this.enemy = enemyCharacter;
        this.playerChoice = null;
        this.enemyChoice = null;
        this.roundHistory = [];
        this.isPlayerTurn = true;
    }

    // 玩家选择
    setPlayerChoice(choice) {
        this.playerChoice = choice; // 'rock', 'scissors', 'paper'
    }

    // 敌人随机选择
    makeEnemyChoice() {
        const choices = ['rock', 'scissors', 'paper'];
        this.enemyChoice = choices[Math.floor(Math.random() * 3)];
    }

    // 执行回合
    executeRound() {
        if (!this.playerChoice) return null;

        this.makeEnemyChoice();

        const result = this.calculateRoundResult();
        this.applyDamage(result);

        this.roundHistory.push({
            playerChoice: this.playerChoice,
            enemyChoice: this.enemyChoice,
            result: result,
            playerHealth: this.player.currentHealth,
            enemyHealth: this.enemy.currentHealth
        });

        const roundResult = {
            playerChoice: this.playerChoice,
            enemyChoice: this.enemyChoice,
            result: result,
            playerDamage: result.playerDamage,
            enemyDamage: result.enemyDamage,
            winner: result.winner,
            playerPierced: result.playerPierced,
            enemyPierced: result.enemyPierced
        };

        this.playerChoice = null;
        this.enemyChoice = null;

        return roundResult;
    }

    // 计算回合结果
    calculateRoundResult() {
        const p = this.playerChoice;
        const e = this.enemyChoice;

        let winner = null;
        let playerDamage = 0;
        let enemyDamage = 0;
        // 破防: 出防御方本来赢, 但攻击力高过其防御, 仍会被打出(重击 - 防御)的溢出伤害
        let playerPierced = false;   // 我方防御被对方重击破开
        let enemyPierced = false;    // 对方防御被我方重击破开

        // 石头(重击) vs 剪刀(突袭)
        if (p === 'rock' && e === 'scissors') {
            winner = 'player';
            enemyDamage = this.player.finalStats.heavyAttack;
        } else if (p === 'scissors' && e === 'rock') {
            winner = 'enemy';
            playerDamage = this.enemy.finalStats.heavyAttack;
        }
        // 剪刀(突袭) vs 布(防御)
        else if (p === 'scissors' && e === 'paper') {
            winner = 'player';
            enemyDamage = this.player.finalStats.rushAttack;
        } else if (p === 'paper' && e === 'scissors') {
            winner = 'enemy';
            playerDamage = this.enemy.finalStats.rushAttack;
        }
        // 布(防御) vs 石头(重击)
        else if (p === 'paper' && e === 'rock') {
            winner = 'player';
            // 出布者获胜, 但仍要承受 (对方重击 - 自身防御) 的溢出伤害
            playerDamage = Math.max(0, this.enemy.finalStats.heavyAttack - this.player.finalStats.defense);
            playerPierced = this.enemy.finalStats.heavyAttack > this.player.finalStats.defense;
        } else if (p === 'rock' && e === 'paper') {
            winner = 'enemy';
            enemyDamage = Math.max(0, this.player.finalStats.heavyAttack - this.enemy.finalStats.defense);
            enemyPierced = this.player.finalStats.heavyAttack > this.enemy.finalStats.defense;
        }
        // 平局
        else if (p === e) {
            winner = 'draw';
            if (p === 'rock') {
                // 石头 vs 石头: 双方受重击伤害
                playerDamage = this.enemy.finalStats.heavyAttack;
                enemyDamage = this.player.finalStats.heavyAttack;
            } else if (p === 'scissors') {
                // 剪刀 vs 剪刀: 双方受突袭伤害
                playerDamage = this.enemy.finalStats.rushAttack;
                enemyDamage = this.player.finalStats.rushAttack;
            } else if (p === 'paper') {
                // 布 vs 布: 双方不受伤
                playerDamage = 0;
                enemyDamage = 0;
            }
        }

        return {
            winner: winner,
            playerDamage: playerDamage,
            enemyDamage: enemyDamage,
            playerPierced: playerPierced,
            enemyPierced: enemyPierced
        };
    }

    // 应用伤害
    applyDamage(result) {
        this.player.currentHealth = Math.max(0, this.player.currentHealth - result.playerDamage);
        this.enemy.currentHealth = Math.max(0, this.enemy.currentHealth - result.enemyDamage);
    }

    // 检查战斗是否结束
    isOver() {
        return this.player.currentHealth <= 0 || this.enemy.currentHealth <= 0;
    }

    // 获取胜利者
    getWinner() {
        if (this.player.currentHealth > 0 && this.enemy.currentHealth <= 0) {
            return 'player';
        } else if (this.enemy.currentHealth > 0 && this.player.currentHealth <= 0) {
            return 'enemy';
        }
        return null;
    }

    // 获取选择的中文名称
    static getChoiceName(choice) {
        const names = {
            rock: '重击',
            scissors: '突袭',
            paper: '防御'
        };
        return names[choice] || choice;
    }

    // 获取选择的原始名称
    static getChoiceRawName(choice) {
        const names = {
            rock: '石头',
            scissors: '剪刀',
            paper: '布'
        };
        return names[choice] || choice;
    }
}