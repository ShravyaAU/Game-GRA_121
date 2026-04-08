const TOTAL_ROUNDS = 10

let roundIndex = 0
let score = 0
let answered = false

let rounds = []

function randomInt(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

function randomColor(){
return `rgb(${randomInt(20,235)},${randomInt(20,235)},${randomInt(20,235)})`
}

function slightlyDifferent(color){
let nums=color.match(/\d+/g).map(Number)
nums[0]+=randomInt(-10,10)
nums[1]+=randomInt(-10,10)
nums[2]+=randomInt(-10,10)
return `rgb(${nums[0]},${nums[1]},${nums[2]})`
}

function buildRound(n){

let same=[1,3,4,6,7,9].includes(n)

let bgA=randomColor()
let bgB=randomColor()

let center=randomColor()

let centerA=center
let centerB=same?center:slightlyDifferent(center)

return{
bgA,bgB,centerA,centerB,
answer:same?"same":"different"
}

}

function buildGame(){
rounds=[]
for(let i=1;i<=TOTAL_ROUNDS;i++){
rounds.push(buildRound(i))
}
}

function renderRound(){

let r=rounds[roundIndex]

document.getElementById("round").textContent=`Round ${roundIndex+1} / 10`
document.getElementById("score").textContent=`Score: ${score}`

document.getElementById("progressBar").style.width=
((roundIndex)/TOTAL_ROUNDS*100)+"%"

let panelA=document.getElementById("panelA")
let panelB=document.getElementById("panelB")

panelA.style.background=r.bgA
panelB.style.background=r.bgB

panelA.innerHTML=""
panelB.innerHTML=""

let sqA=document.createElement("div")
sqA.className="centerSquare"
sqA.style.background=r.centerA

let sqB=document.createElement("div")
sqB.className="centerSquare"
sqB.style.background=r.centerB

panelA.appendChild(sqA)
panelB.appendChild(sqB)

renderAnswers()
}

function shuffle(arr){
return arr.sort(()=>Math.random()-.5)
}

function renderAnswers(){

let container=document.getElementById("answerButtons")
container.innerHTML=""

let options=shuffle(["same","different"])

options.forEach(opt=>{
let btn=document.createElement("button")
btn.textContent=opt.toUpperCase()

btn.onclick=()=>handleAnswer(opt)

container.appendChild(btn)
})

}

function handleAnswer(choice){

if(answered)return

answered=true

let round=rounds[roundIndex]

let correct=choice===round.answer

if(correct)score+=10

let buttons=document.querySelectorAll("#answerButtons button")

buttons.forEach(btn=>{
if(btn.textContent.toLowerCase()===round.answer)
btn.classList.add("correct")

if(btn.textContent.toLowerCase()===choice && choice!==round.answer)
btn.classList.add("wrong")

btn.disabled=true
})

document.getElementById("feedback").textContent=
correct?
"Correct Color — Nice Eagle Eye."
:"Incorrect — So close, but Nope."

document.getElementById("nextBtn").disabled=false

if(roundIndex===TOTAL_ROUNDS-1){
finishGame()
}

}

function nextRound(){

if(!answered)return

roundIndex++
answered=false

document.getElementById("feedback").textContent="New round."

renderRound()

document.getElementById("nextBtn").disabled=true

}

function finishGame(){

scormSetScore(score,100)
scormSetCompletion("completed")
scormSave()

document.getElementById("feedback").textContent=
`Final score ${score}/100`

}

function restart(){

buildGame()

roundIndex=0
score=0
answered=false

renderRound()

}

document.getElementById("nextBtn").onclick=nextRound
document.getElementById("restartBtn").onclick=restart

window.onload=()=>{
scormInit()
buildGame()
renderRound()
}
