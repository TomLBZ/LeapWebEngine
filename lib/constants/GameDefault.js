export const GAME_DEFAULTS = {
    "DEFAULT_SIMUL_TIMESTEP": 1000. / 60.,
    "DEFAULT_FRAME_DELTA": 0.,
    "DEFAULT_FPS": 60.,
    "DEFAULT_FPS_ALPHA": 0.9,
    "DEFAULT_FPS_UPDATE_INT": 1000.,
    "DEFAULT_MIN_FRAME_DELAY": 0.,
    "DEFAULT_BAILOUOT": 240.,
}

export const CAM_DEFAULTS = {
    "ROT_DW": 1.,
    "ROT_DECAY": 0.8,
    "POS": [0.,0.,0.],
    "DIR": [0.,0.,-1.],
    "UP": [0.,1.,0.],
    "DIR4": [0.,0.,-1.,0.],
    "UP4": [0.,1.,0.,0.],
    "CAM_TURN_RANGE": 180.,
    "CAM_DRIVE": 2.5,
    "CAM_DRAG": 1.0,
    "CAM_JUMP": 25.0,
    "CAM_JUMP_CYCLES": 10,
    "LINEAR_V": 1.0,
    "MIN_V": 0.05,
    "TRANS_DECAY": 0.8,
}

export const PHYSICS_DEFAULTS = {
    "G": 9.81,
    "f": 0.10,
    "BOUNCE": 0.1,
    "SPHERE_STIFFNESS": 60.0,
}