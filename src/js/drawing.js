const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const drawCircle = (coords, radius, color) => {
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, radius, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

const drawEmptyCircle = (coords, radius, color) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(coords.x, coords.y, radius, 0, Math.PI*2);
    ctx.stroke();
}

const writeText = (coords, text, color) => {
    ctx.font = "15px Arial";
    ctx.fillText(text, coords.x, coords.y);
}

const drawImage = (coords, image, size) => {
    ctx.drawImage(image, coords.x-size.x/2, coords.y-size.y/2, size.x, size.y);
}

const clear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export {
    canvas,
    clear,
    drawImage,
    drawCircle,
    drawEmptyCircle,
    writeText
}