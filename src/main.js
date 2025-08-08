import { setupInput, Keys } from './input.js';
import { Engine } from './core/engine.js';
import { createLevel1Scene } from './scenes/levelScene.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const engine = new Engine(ctx, canvas.width, canvas.height);

setupInput();
engine.setScene(createLevel1Scene());
engine.start();
