const canvas = document.getElementById('atomCanvas');
const ctx = canvas.getContext('2d');

const atom = { x: canvas.width/2, y: canvas.height/2, radius: 50, color: 'blue' };
const smallAtoms = [];

function drawAtom() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessine l'atome principal
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
    ctx.fillStyle = atom.color;
    ctx.fill();
    ctx.closePath();

    // Dessine les petits atomes autour de l'atome principal
    for (const smallAtom of smallAtoms) {
        ctx.beginPath();
        ctx.arc(smallAtom.x, smallAtom.y, smallAtom.radius, 0, Math.PI * 2);
        ctx.fillStyle = smallAtom.color;
        ctx.fill();
        ctx.closePath();

        // Déplace les petits atomes de façon aléatoire
        smallAtom.x += smallAtom.speedX;
        smallAtom.y += smallAtom.speedY;

        // Assurez-vous que les petits atomes restent dans le canvas
        if (smallAtom.x < 0 || smallAtom.x > canvas.width) {
            smallAtom.speedX *= -1;
        }
        if (smallAtom.y < 0 || smallAtom.y > canvas.height) {
            smallAtom.speedY *= -1;
        }
    }

    requestAnimationFrame(drawAtom);
}

// Créez quelques petits atomes initiaux
for (let i = 0; i < 20; i++) {
    if (i === 1) {
        smallAtoms.push({
            x: Math.random() * (canvas.width - 10),
            y: Math.random() * (canvas.height - 10),
            radius: 2,
            color: 'yellow',
            speedX: Math.random() * 30 - 2,
            speedY: Math.random() * 30 - 2
        });
    } else {
        smallAtoms.push({
            x: Math.random() * (canvas.width - 10),
            y: Math.random() * (canvas.height - 10),
            radius: 2,
            color: 'red',
            speedX: Math.random() * 30 - 2,
            speedY: Math.random() * 30 - 2
        });
    }
}

drawAtom();
