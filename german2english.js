//document.body.style.border = "5px solid red";
//console.log("The add-on is working");

const langenscheidtURL = "https://en.langenscheidt.com/german-english/";

const displayblock = document.createElement('div');
displayblock.id = 'German2English';
document.body.appendChild(displayblock);

//browser.storage.local.get().then(res=>{ console.log(res) });

/*
const spelling = document.createElement('div');
spelling.id = 'spelling';
displayblock.appendChild(spelling);

const allDefinition = document.createElement('div');
allDefinition.id = 'defintions';
displayblock.appendChild(allDefinition);
*/

// a meaning is a (list) definition(s) with no or some example;
class Meaning{
    constructor(){
        this.definitions = [];
        //this.example = [];
    }
}
/*
// a example is a german sentence and a english sentence
class Example{
    constructor(german, english){
        this.german = german;
        this.english = english;
    }
}*/

//A WORD is a array of meaning 
class Word{
    constructor(spell){
        this.spell = spell;
        this.meanings = [];
    }
}

//TODO: connect to local storage to find saved div size

//TODO: to create the div and hide it


// get the user selection
function getSelectionText() {
    let text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function fetchTranslation(highlighted){
    fetch( langenscheidtURL + highlighted )
    .then(res => res.text())
    .then(res =>{
        //console.log(res);
        return langenscheidt(res, highlighted);
    })
    .then(res =>{
        //console.log(res);
        render_translation(res);
    })
    .catch(err => {
        //console.log(err)
    });
}

function langenscheidt(html , word){
    let searchWord = new Word(word);

    let results = { definition : [  ] };

    let findall = /<div class="summary">[^]+?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*/ig;

    let all = html.match(findall);

    let findeach = /btn-inner\">[\w, ]+?</ig;

    if(!all){
        //console.log("can't find");
        searchWord.meanings.push(new Meaning());
        searchWord.meanings[0].definitions[0] = `Can't find translation`;
        return searchWord;
    }

    all.forEach( (element, index) => {
        let tempfindmeaning = element.match(findeach);

        if(!tempfindmeaning) return;

        results.definition[index] = [];

        tempfindmeaning.forEach(ele =>{

            ele = ele.slice(12,-1);

            //console.log('       in ss loop ', ele);
            if(!results.definition[index].includes(ele))
                results.definition[index].push(ele);
        });

        //console.log("   ",index, results.definition[index]);
    });

    //console.log("each", results.definition);

    results.definition.forEach(element =>{
        let tempmeaning = new Meaning();
        element.forEach(ele =>{
            tempmeaning.definitions.push(ele);
        })
        searchWord.meanings.push(tempmeaning);
    })

    //console.log(searchWord);

    browser.storage.local.get('all_words')
    .then(res => {
        //console.log(res);
        if(JSON.stringify(res)==JSON.stringify({})) res = [searchWord];
        else{
            res = res.all_words;
            res.push(searchWord);
        }
             //res = JSON.parse(res);
        browser.storage.local.set( { 'all_words' : res } );
    })
    .catch(err=>{
        console.log(err);
    })

    return searchWord;
}

function render_loading(word){
    displayblock.style =`
    position: fixed;
    z-index: 1000; 
    right: 10px;
    top: 10px;
    height: auto;
    width: auto;

    min-height: 150px;

    min-width:  250px;
    max-width: 22vw;
    background-color: #262626;
    border-radius: 20px;
    font-size : 16px;
    opacity: 0.95;
    box-shadow: 5px 5px 10px #1e1e1e;
    `;

    let spelling = document.createElement("div");
    spelling.id = "spelling";
    spelling.innerText = word;
    spelling.style = `
        color : #3aeaea;
        padding: 20px 0 0 20px;
        font-weight: bold;
        font-size: 22px;
        text-transform: capitalize;
    `;
    displayblock.appendChild(spelling);

    let ruler = document.createElement('hr');
    ruler.style = ` 
        border-top: 1px solid #add3d3; 
        margin: 7px;
    `;
    displayblock.appendChild(ruler);

    let defin = document.createElement('div');
    defin.id = 'defin';
    defin.innerText  = "loading...";
    defin.style =`
        width: 100%;
        height: 100%;
        max-height: 75vh;
        text-align: center;
        color:#b7bfbf;
        overflow-y: auto;
    `;
    displayblock.appendChild(defin);
}

function render_translation(Word){
    let defin = document.getElementById('defin');
    defin.innerHTML = '';

    //console.log(Word);

    Word.meanings.forEach(element =>{

        //console.log(element)

        let meaningdiv = document.createElement('div');

        meaningdiv.style =`
            margin: 10px;
            text-align : left; 
            border-bottom: 1px solid #add3d3; 
        `;

        element.definitions.forEach( ele =>{
            let defdiv = document.createElement('span');
            defdiv.style =`
                display: inline-block;
                color: #262626;
                background-color: #6ed8d8;
                width: auto;
                padding: 0 2px;
                margin: 5px;
                border-radius: 7px;
            `;
            defdiv.innerText = ele;
            meaningdiv.appendChild(defdiv);
        });

        defin.appendChild(meaningdiv)
    })
    try{
    let link = document.createElement('a');
    link.href = langenscheidtURL + Word.spell;
    //link.target ="_blank";
    link.innerText = `See the whole text @langenscheidt.com`;
    link.style =`
        display: inline-block;
        color: #875c12;
        padding: 7px;
        font-size: 12px;
        text-align: center;
        width: 100%;
    `;
    displayblock.appendChild(link);
    }
    catch(e){console.log(e)};
}

document.onmouseup = function(){
    
    let highlighted = getSelectionText();

    if(!highlighted){
        displayblock.style =`
            display=none;
        `;
        displayblock.innerHTML = '';
        return;
    }

    highlighted = highlighted.split(/[ .,\?\!\*\-]/);

    //console.log(highlighted);

    if(highlighted.length>1 && highlighted[1]!=''){
        //more then one word don't support
        return;
    }

    highlighted = highlighted[0].toLocaleLowerCase();
    
    //console.log( highlighted );
    //console.log( langenscheidtURL + highlighted );

    render_loading(highlighted);

    browser.storage.local.get()
    .then(res=>{
        if(JSON.stringify(res)!=JSON.stringify({})) res = res.all_words;
        else res = [];
        //console.log(res);
        let indexofword = res.findIndex(ele => ele.spell == highlighted);
        if(indexofword == -1) {
            //console.log("fetching")
            fetchTranslation(highlighted);
        }
        else {
            //console.log('found in local storage');
            render_translation(res[indexofword]);
        }
    })
}