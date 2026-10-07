// 孕娘王者 - 游戏数据定义
// Game Data: Characters, Pregnancy Heroine Spirits (英灵卡), and Configuration

// 角色数据 - 10 个
// 立绘规格 832x1216; 每个角色一个文件夹, 9 张图:
//   card 正面卡图(抽卡/选卡用) / normal 未孕穿衣 / damaged 未孕破衣 / naked 未孕全裸 / defeated 未孕战败cg
//   pregnant 怀孕穿衣 / pregnant_damaged 怀孕破衣 / pregnant_naked 怀孕全裸 / pregnant_defeated 怀孕战败cg
// 素材一律侧身向右; 敌方位置由 CSS 自动镜像, 不需要另做朝左的图
const CHARACTERS = {
    character_default: {
        id: 'character_default',
        name: '黑川澪',
        type: 'character',
        rarity: 'common',
        order: 1,
        stats: { heavyAttack: 4, rushAttack: 4, defense: 4, health: 32 },
        images: {
            card: 'assets/images/characters/c03_kurokawa/card.png',
            normal: {
                full: 'assets/images/characters/c03_kurokawa/normal.png',
                damaged: 'assets/images/characters/c03_kurokawa/damaged.png',
                naked: 'assets/images/characters/c03_kurokawa/naked.png',
                defeated: 'assets/images/characters/c03_kurokawa/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c03_kurokawa/pregnant.png',
                damaged: 'assets/images/characters/c03_kurokawa/pregnant_damaged.png',
                naked: 'assets/images/characters/c03_kurokawa/pregnant_naked.png',
                defeated: 'assets/images/characters/c03_kurokawa/pregnant_defeated.png'
            }
        },
        isDefault: true
    },
    character_001: {
        id: 'character_001',
        name: '金城铃',
        type: 'character',
        rarity: 'common',
        order: 2,
        stats: { heavyAttack: 4, rushAttack: 5, defense: 3, health: 31 },
        images: {
            card: 'assets/images/characters/c04_kaneshiro/card.png',
            normal: {
                full: 'assets/images/characters/c04_kaneshiro/normal.png',
                damaged: 'assets/images/characters/c04_kaneshiro/damaged.png',
                naked: 'assets/images/characters/c04_kaneshiro/naked.png',
                defeated: 'assets/images/characters/c04_kaneshiro/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c04_kaneshiro/pregnant.png',
                damaged: 'assets/images/characters/c04_kaneshiro/pregnant_damaged.png',
                naked: 'assets/images/characters/c04_kaneshiro/pregnant_naked.png',
                defeated: 'assets/images/characters/c04_kaneshiro/pregnant_defeated.png'
            }
        },
        isDefault: false
    },
    character_002: {
        id: 'character_002',
        name: '橘花',
        type: 'character',
        rarity: 'common',
        order: 3,
        stats: { heavyAttack: 3, rushAttack: 3, defense: 5, health: 38 },
        images: {
            card: 'assets/images/characters/c07_tachibana/card.png',
            normal: {
                full: 'assets/images/characters/c07_tachibana/normal.png',
                damaged: 'assets/images/characters/c07_tachibana/damaged.png',
                naked: 'assets/images/characters/c07_tachibana/naked.png',
                defeated: 'assets/images/characters/c07_tachibana/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c07_tachibana/pregnant.png',
                damaged: 'assets/images/characters/c07_tachibana/pregnant_damaged.png',
                naked: 'assets/images/characters/c07_tachibana/pregnant_naked.png',
                defeated: 'assets/images/characters/c07_tachibana/pregnant_defeated.png'
            }
        },
        isDefault: false
    },
    character_003: {
        id: 'character_003',
        name: '神代千鹤',
        type: 'character',
        rarity: 'rare',
        order: 4,
        stats: { heavyAttack: 4, rushAttack: 3, defense: 6, health: 34 },
        images: {
            card: 'assets/images/characters/c01_kamishiro/card.png',
            normal: {
                full: 'assets/images/characters/c01_kamishiro/normal.png',
                damaged: 'assets/images/characters/c01_kamishiro/damaged.png',
                naked: 'assets/images/characters/c01_kamishiro/naked.png',
                defeated: 'assets/images/characters/c01_kamishiro/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c01_kamishiro/pregnant.png',
                damaged: 'assets/images/characters/c01_kamishiro/pregnant_damaged.png',
                naked: 'assets/images/characters/c01_kamishiro/pregnant_naked.png',
                defeated: 'assets/images/characters/c01_kamishiro/pregnant_defeated.png'
            }
        },
        isDefault: false
    },
    character_004: {
        id: 'character_004',
        name: '红玛丽',
        type: 'character',
        rarity: 'rare',
        order: 5,
        stats: { heavyAttack: 5, rushAttack: 5, defense: 5, health: 38 },
        images: {
            card: 'assets/images/characters/c05_mari/card.png',
            normal: {
                full: 'assets/images/characters/c05_mari/normal.png',
                damaged: 'assets/images/characters/c05_mari/damaged.png',
                naked: 'assets/images/characters/c05_mari/naked.png',
                defeated: 'assets/images/characters/c05_mari/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c05_mari/pregnant.png',
                damaged: 'assets/images/characters/c05_mari/pregnant_damaged.png',
                naked: 'assets/images/characters/c05_mari/pregnant_naked.png',
                defeated: 'assets/images/characters/c05_mari/pregnant_defeated.png'
            }
        },
        isDefault: false
    },
    character_005: {
        id: 'character_005',
        name: '艾莉丝',
        type: 'character',
        rarity: 'epic',
        order: 6,
        stats: { heavyAttack: 5, rushAttack: 4, defense: 8, health: 52 },
        images: {
            card: 'assets/images/characters/c02_elise/card.png',
            normal: {
                full: 'assets/images/characters/c02_elise/normal.png',
                damaged: 'assets/images/characters/c02_elise/damaged.png',
                naked: 'assets/images/characters/c02_elise/naked.png',
                defeated: 'assets/images/characters/c02_elise/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c02_elise/pregnant.png',
                damaged: 'assets/images/characters/c02_elise/pregnant_damaged.png',
                naked: 'assets/images/characters/c02_elise/pregnant_naked.png',
                defeated: 'assets/images/characters/c02_elise/pregnant_defeated.png'
            }
        },
        isDefault: false
    },
    character_006: {
        id: 'character_006',
        name: '苍井雪乃',
        type: 'character',
        rarity: 'epic',
        order: 7,
        stats: { heavyAttack: 6, rushAttack: 6, defense: 6, health: 50 },
        images: {
            card: 'assets/images/characters/c08_aoi/card.png',
            normal: {
                full: 'assets/images/characters/c08_aoi/normal.png',
                damaged: 'assets/images/characters/c08_aoi/damaged.png',
                naked: 'assets/images/characters/c08_aoi/naked.png',
                defeated: 'assets/images/characters/c08_aoi/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c08_aoi/pregnant.png',
                damaged: 'assets/images/characters/c08_aoi/pregnant_damaged.png',
                naked: 'assets/images/characters/c08_aoi/pregnant_naked.png',
                defeated: 'assets/images/characters/c08_aoi/pregnant_defeated.png'
            }
        },
        isDefault: false
    },
    character_007: {
        id: 'character_007',
        name: '朱玉兰',
        type: 'character',
        rarity: 'epic',
        order: 8,
        stats: { heavyAttack: 8, rushAttack: 6, defense: 4, health: 46 },
        images: {
            card: 'assets/images/characters/c09_yulan/card.png',
            normal: {
                full: 'assets/images/characters/c09_yulan/normal.png',
                damaged: 'assets/images/characters/c09_yulan/damaged.png',
                naked: 'assets/images/characters/c09_yulan/naked.png',
                defeated: 'assets/images/characters/c09_yulan/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c09_yulan/pregnant.png',
                damaged: 'assets/images/characters/c09_yulan/pregnant_damaged.png',
                naked: 'assets/images/characters/c09_yulan/pregnant_naked.png',
                defeated: 'assets/images/characters/c09_yulan/pregnant_defeated.png'
            }
        },
        isDefault: false
    },
    character_008: {
        id: 'character_008',
        name: '莉可',
        type: 'character',
        rarity: 'legendary',
        order: 9,
        stats: { heavyAttack: 9, rushAttack: 7, defense: 5, health: 62 },
        images: {
            card: 'assets/images/characters/c06_rico/card.png',
            normal: {
                full: 'assets/images/characters/c06_rico/normal.png',
                damaged: 'assets/images/characters/c06_rico/damaged.png',
                naked: 'assets/images/characters/c06_rico/naked.png',
                defeated: 'assets/images/characters/c06_rico/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c06_rico/pregnant.png',
                damaged: 'assets/images/characters/c06_rico/pregnant_damaged.png',
                naked: 'assets/images/characters/c06_rico/pregnant_naked.png',
                defeated: 'assets/images/characters/c06_rico/pregnant_defeated.png'
            }
        },
        isDefault: false
    },
    character_009: {
        id: 'character_009',
        name: '桃千夏',
        type: 'character',
        rarity: 'legendary',
        order: 10,
        stats: { heavyAttack: 8, rushAttack: 8, defense: 7, health: 68 },
        images: {
            card: 'assets/images/characters/c10_momochika/card.png',
            normal: {
                full: 'assets/images/characters/c10_momochika/normal.png',
                damaged: 'assets/images/characters/c10_momochika/damaged.png',
                naked: 'assets/images/characters/c10_momochika/naked.png',
                defeated: 'assets/images/characters/c10_momochika/defeated.png'
            },
            pregnant: {
                full: 'assets/images/characters/c10_momochika/pregnant.png',
                damaged: 'assets/images/characters/c10_momochika/pregnant_damaged.png',
                naked: 'assets/images/characters/c10_momochika/pregnant_naked.png',
                defeated: 'assets/images/characters/c10_momochika/pregnant_defeated.png'
            }
        },
        isDefault: false
    }
};

// 孕娘英灵卡（原"招式卡/宝宝卡"）—— 怀孕的二次元少女们的英魂, 助你的孕娘战斗
// 每张卡提供四项属性加成, 与角色卡叠加后决定战斗数值
const SPIRITS = {
    spirit_01: {
        id: 'spirit_01',
        name: '吉尔',
        type: 'spirit',
        rarity: 'common',
        order: 1,
        bonusStats: { heavyAttack: 0, rushAttack: 0, defense: 0, health: 4 },
        image: 'assets/images/spirits/jill.png'
    },
    spirit_02: {
        id: 'spirit_02',
        name: '药师寺凉子',
        type: 'spirit',
        rarity: 'common',
        order: 2,
        bonusStats: { heavyAttack: 2, rushAttack: 0, defense: 1, health: 0 },
        image: 'assets/images/spirits/ryoko.png'
    },
    spirit_03: {
        id: 'spirit_03',
        name: 'Lili',
        type: 'spirit',
        rarity: 'common',
        order: 3,
        bonusStats: { heavyAttack: 0, rushAttack: 3, defense: 0, health: 0 },
        image: 'assets/images/spirits/lili.png'
    },
    spirit_04: {
        id: 'spirit_04',
        name: '东海帝王',
        type: 'spirit',
        rarity: 'common',
        order: 4,
        bonusStats: { heavyAttack: 0, rushAttack: 2, defense: 0, health: 2 },
        image: 'assets/images/spirits/teio.png'
    },
    spirit_05: {
        id: 'spirit_05',
        name: '丰川祥子',
        type: 'spirit',
        rarity: 'common',
        order: 5,
        bonusStats: { heavyAttack: 0, rushAttack: 0, defense: 3, health: 0 },
        image: 'assets/images/spirits/sakiko.png'
    },
    spirit_06: {
        id: 'spirit_06',
        name: '后藤独',
        type: 'spirit',
        rarity: 'common',
        order: 6,
        bonusStats: { heavyAttack: 0, rushAttack: 0, defense: 3, health: 0 },
        image: 'assets/images/spirits/bocchi.png'
    },
    spirit_07: {
        id: 'spirit_07',
        name: '白井黑子',
        type: 'spirit',
        rarity: 'common',
        order: 7,
        bonusStats: { heavyAttack: 0, rushAttack: 3, defense: 0, health: 0 },
        image: 'assets/images/spirits/kuroko.png'
    },
    spirit_08: {
        id: 'spirit_08',
        name: '秋山澪',
        type: 'spirit',
        rarity: 'common',
        order: 8,
        bonusStats: { heavyAttack: 1, rushAttack: 0, defense: 2, health: 0 },
        image: 'assets/images/spirits/mio.png'
    },
    spirit_09: {
        id: 'spirit_09',
        name: '西住美穗',
        type: 'spirit',
        rarity: 'common',
        order: 9,
        bonusStats: { heavyAttack: 0, rushAttack: 0, defense: 2, health: 2 },
        image: 'assets/images/spirits/miho.png'
    },
    spirit_10: {
        id: 'spirit_10',
        name: '调月莉音',
        type: 'spirit',
        rarity: 'common',
        order: 10,
        bonusStats: { heavyAttack: 3, rushAttack: 0, defense: 0, health: 0 },
        image: 'assets/images/spirits/rio.png'
    },
    spirit_11: {
        id: 'spirit_11',
        name: '高松灯',
        type: 'spirit',
        rarity: 'common',
        order: 11,
        bonusStats: { heavyAttack: 0, rushAttack: 0, defense: 0, health: 5 },
        image: 'assets/images/spirits/tomori.png'
    },
    spirit_12: {
        id: 'spirit_12',
        name: '高町奈叶',
        type: 'spirit',
        rarity: 'common',
        order: 12,
        bonusStats: { heavyAttack: 3, rushAttack: 0, defense: 0, health: 0 },
        image: 'assets/images/spirits/nayo.png'
    },
    spirit_13: {
        id: 'spirit_13',
        name: '艾露莎',
        type: 'spirit',
        rarity: 'rare',
        order: 13,
        bonusStats: { heavyAttack: 3, rushAttack: 0, defense: 3, health: 0 },
        image: 'assets/images/spirits/erza.png'
    },
    spirit_14: {
        id: 'spirit_14',
        name: '罗宾',
        type: 'spirit',
        rarity: 'rare',
        order: 14,
        bonusStats: { heavyAttack: 0, rushAttack: 0, defense: 4, health: 3 },
        image: 'assets/images/spirits/robin.png'
    },
    spirit_15: {
        id: 'spirit_15',
        name: '玉藻前',
        type: 'spirit',
        rarity: 'rare',
        order: 15,
        bonusStats: { heavyAttack: 3, rushAttack: 3, defense: 0, health: 0 },
        image: 'assets/images/spirits/tamamo.png'
    },
    spirit_16: {
        id: 'spirit_16',
        name: '源赖光',
        type: 'spirit',
        rarity: 'rare',
        order: 16,
        bonusStats: { heavyAttack: 4, rushAttack: 0, defense: 0, health: 3 },
        image: 'assets/images/spirits/raikou.png'
    },
    spirit_17: {
        id: 'spirit_17',
        name: '艾达王',
        type: 'spirit',
        rarity: 'rare',
        order: 17,
        bonusStats: { heavyAttack: 0, rushAttack: 4, defense: 2, health: 0 },
        image: 'assets/images/spirits/ada.png'
    },
    spirit_18: {
        id: 'spirit_18',
        name: '黑百合',
        type: 'spirit',
        rarity: 'rare',
        order: 18,
        bonusStats: { heavyAttack: 5, rushAttack: 2, defense: 0, health: 0 },
        image: 'assets/images/spirits/widowmaker.png'
    },
    spirit_19: {
        id: 'spirit_19',
        name: '艾米莉亚',
        type: 'spirit',
        rarity: 'rare',
        order: 19,
        bonusStats: { heavyAttack: 0, rushAttack: 0, defense: 3, health: 4 },
        image: 'assets/images/spirits/emilia.png'
    },
    spirit_20: {
        id: 'spirit_20',
        name: '两仪式',
        type: 'spirit',
        rarity: 'rare',
        order: 20,
        bonusStats: { heavyAttack: 2, rushAttack: 5, defense: 0, health: 0 },
        image: 'assets/images/spirits/shiki.png'
    },
    spirit_21: {
        id: 'spirit_21',
        name: '苍崎青子',
        type: 'spirit',
        rarity: 'rare',
        order: 21,
        bonusStats: { heavyAttack: 4, rushAttack: 3, defense: 0, health: 0 },
        image: 'assets/images/spirits/aoko.png'
    },
    spirit_22: {
        id: 'spirit_22',
        name: '三笠',
        type: 'spirit',
        rarity: 'rare',
        order: 22,
        bonusStats: { heavyAttack: 0, rushAttack: 4, defense: 0, health: 3 },
        image: 'assets/images/spirits/mikasa.png'
    },
    spirit_23: {
        id: 'spirit_23',
        name: '蒂法',
        type: 'spirit',
        rarity: 'epic',
        order: 23,
        bonusStats: { heavyAttack: 6, rushAttack: 4, defense: 0, health: 0 },
        image: 'assets/images/spirits/tifa.png'
    },
    spirit_24: {
        id: 'spirit_24',
        name: '春丽',
        type: 'spirit',
        rarity: 'epic',
        order: 24,
        bonusStats: { heavyAttack: 0, rushAttack: 6, defense: 4, health: 0 },
        image: 'assets/images/spirits/chunli.png'
    },
    spirit_25: {
        id: 'spirit_25',
        name: '不知火舞',
        type: 'spirit',
        rarity: 'epic',
        order: 25,
        bonusStats: { heavyAttack: 5, rushAttack: 5, defense: 0, health: 0 },
        image: 'assets/images/spirits/mai.png'
    },
    spirit_26: {
        id: 'spirit_26',
        name: '2B',
        type: 'spirit',
        rarity: 'epic',
        order: 26,
        bonusStats: { heavyAttack: 0, rushAttack: 6, defense: 0, health: 5 },
        image: 'assets/images/spirits/n2b.png'
    },
    spirit_27: {
        id: 'spirit_27',
        name: '纲手',
        type: 'spirit',
        rarity: 'epic',
        order: 27,
        bonusStats: { heavyAttack: 5, rushAttack: 0, defense: 0, health: 8 },
        image: 'assets/images/spirits/tsunade.png'
    },
    spirit_28: {
        id: 'spirit_28',
        name: '汉库克',
        type: 'spirit',
        rarity: 'epic',
        order: 28,
        bonusStats: { heavyAttack: 7, rushAttack: 0, defense: 4, health: 0 },
        image: 'assets/images/spirits/hancock.png'
    },
    spirit_29: {
        id: 'spirit_29',
        name: '斯卡哈',
        type: 'spirit',
        rarity: 'epic',
        order: 29,
        bonusStats: { heavyAttack: 4, rushAttack: 7, defense: 0, health: 0 },
        image: 'assets/images/spirits/scathach.png'
    },
    spirit_30: {
        id: 'spirit_30',
        name: 'DVa',
        type: 'spirit',
        rarity: 'epic',
        order: 30,
        bonusStats: { heavyAttack: 0, rushAttack: 0, defense: 7, health: 6 },
        image: 'assets/images/spirits/dva.png'
    },
    spirit_31: {
        id: 'spirit_31',
        name: '黄前久美子',
        type: 'spirit',
        rarity: 'legendary',
        order: 31,
        bonusStats: { heavyAttack: 6, rushAttack: 6, defense: 6, health: 6 },
        image: 'assets/images/spirits/kumiko.png'
    },
    spirit_32: {
        id: 'spirit_32',
        name: '橘爱丽丝',
        type: 'spirit',
        rarity: 'legendary',
        order: 32,
        bonusStats: { heavyAttack: 8, rushAttack: 8, defense: 4, health: 6 },
        image: 'assets/images/spirits/alice.png'
    },
    spirit_33: {
        id: 'spirit_33',
        name: 'Terra',
        type: 'spirit',
        rarity: 'legendary',
        order: 33,
        bonusStats: { heavyAttack: 6, rushAttack: 4, defense: 8, health: 10 },
        image: 'assets/images/spirits/terra.png'
    },
    spirit_34: {
        id: 'spirit_34',
        name: '伊莉雅',
        type: 'spirit',
        rarity: 'legendary',
        order: 34,
        bonusStats: { heavyAttack: 10, rushAttack: 6, defense: 4, health: 8 },
        image: 'assets/images/spirits/ilya.png'
    }
};

// 稀有度配置
// sortIndex: 卡牌列表排序用的稀有度档位(普通 -> 传说)
const RARITY_CONFIG = {
    common: {
        name: '普通',
        color: '#9ca3af',
        probability: 0.55,
        sellPrice: 2,
        sortIndex: 0
    },
    rare: {
        name: '稀有',
        color: '#3b82f6',
        probability: 0.25,
        sellPrice: 5,
        sortIndex: 1
    },
    epic: {
        name: '史诗',
        color: '#a855f7',
        probability: 0.13,
        sellPrice: 10,
        sortIndex: 2
    },
    legendary: {
        name: '传说',
        color: '#fbbf24',
        probability: 0.07,
        sellPrice: 20,
        sortIndex: 3
    }
};

// 卡牌排序: 先按稀有度档位, 再按卡牌自带的 order 编号
// order 与卡名无关 -> 以后改中文名不需要动排序
function compareCards(a, b) {
    const ra = (RARITY_CONFIG[a.rarity] || {}).sortIndex || 0;
    const rb = (RARITY_CONFIG[b.rarity] || {}).sortIndex || 0;
    if (ra !== rb) return ra - rb;
    return (a.order || 0) - (b.order || 0);
}

// 游戏配置
const GAME_CONFIG = {
    // 硬币相关
    initialCoins: 15,
    coinsPerInterval: 5,
    intervalMinutes: 10,  // 改为10分钟

    // 消耗
    coinToContinue: 5,
    coinToStart: 5,  // 改为5币
    coinForBonus: 1,

    // 战斗
    enemiesPerRound: 5,

    // 血量阈值
    damagedThreshold: 0.70,
    nakedThreshold: 0.30,

    // 背景图片
    battleBackgrounds: [
        'assets/images/backgrounds/bg_01.png',
        'assets/images/backgrounds/bg_02.png',
        'assets/images/backgrounds/bg_03.png',
        'assets/images/backgrounds/bg_04.png',
        'assets/images/backgrounds/bg_05.png',
        'assets/images/backgrounds/bg_06.png',
        'assets/images/backgrounds/bg_07.png',
        'assets/images/backgrounds/bg_08.png',
        'assets/images/backgrounds/bg_09.png',
        'assets/images/backgrounds/bg_10.png'
    ]
};

// 文案配置
const TEXTS = {
    welcome: '欢迎来玩!请投币!',
    tutorial: {
        insertCoin: '投入硬币,开始游戏吧!',
        ready: '准备开始游戏!',
        swipeCard: '请刷卡!刷卡结束后,请点击结束。',
        noCharacter: '你还没有刷角色卡。要使用默认角色出击吗?',
        battleStart: '战斗吧!',
        rps: '石头剪刀——布!',
        battleIntro1: '点击石头、剪刀、布,来使用重击、突袭、防御!搭配角色和孕娘英灵卡,战胜你的敌人!',
        battleIntro2: '每回合玩家选择石头、剪刀、布任意,敌人随机选择,选择完成以后进行回合结算。',
        battleIntro3: '石头(重击)克制剪刀(突袭),因此出石头赢了出剪刀的一方,出剪刀的一方将受到伤害,出石头的一方不受到伤害。',
        battleIntro4: '剪刀(突袭)克制布(防御),因此出剪刀赢了出布的一方,出布的一方将受到伤害,出剪刀的一方不受到伤害。',
        battleIntro5: '布(防御)克制石头(重击),因此出布赢了出石头的一方,出布一方的防御值将抵消出重击一方的重击值,也就是最后受到伤害为重击值-防御值。',
        battleIntro6: '如果双方平局: 石头对石头或剪刀对剪刀,则双方都受到伤害;布对布,则双方都不受到伤害。'
    },
    battle: {
        youWin: '你赢了!',
        youLose: '你输了!',
        victory: '你真厉害!你打赢了所有对手!投币领取你的奖励吧!',
        defeat: '你战败了!',
        continue: '重新加入战斗吧!领取你的卡牌!',
        giveUp: '真遗憾!下次也要来玩哦!',
        getReward: '领取你的卡牌,欢迎下次再来玩哦!'
    },
    clickToContinue: '点击继续'
};

// 导出所有数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CHARACTERS,
        SPIRITS,
        RARITY_CONFIG,
        GAME_CONFIG,
        TEXTS,
        compareCards
    };
}