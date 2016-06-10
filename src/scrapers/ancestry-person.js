var debug = require('debug')('ancestry-person'),
    utils = require('../utils'),
    GedcomX = require('gedcomx-js');

var urls = [
  utils.urlPatternToRegex('http://person.ancestry.com/tree/*/person/*'),
  utils.urlPatternToRegex('http://person.ancestryinstitution.com/tree/*/person/*')
];

module.exports = function(register){
  register(urls, run);
};

/**
 * Called when the URL matches.
 * Retrieve HTML for facts tab and process.
 * We do this even if we're already on the facts tab
 * because it's easier to just always request is as
 * opposed to detecting which tab we start on.
 */
function run(emitter) {
  
  debug('run');
  
  // We start on a url such as http://person.ancestry.com/tree/70025770/person/30322313653/facts.
  // We want to strip anything after the second number and replace it with /content/factsbody
  var factsUrl = window.location.pathname.split('/').slice(0,5).join('/') + '/content/factsbody';
  
  debug('url: ' + factsUrl);
  
  // Get facts html
  utils.getJSON(factsUrl, function(error, json){
    debug('response');
    
    // HTTP error
    if(error){
      debug('error');
      emitter.emit('error', error);
    } 
    
    else {
      
      // Error returned by the ancestry api
      if(json.HasError){
        debug(json.ErrorMessage);
        debug(json.FailurePoint);
        emitter.emit('error', json.ErrorMessage);
        return;
      }
      
      if(!json.html.body){
        debug('no html');
        emitter.emit('noData');
        return;
      }
  
      process(emitter, parseHTML(json.html.body));
    }
  });
}

/**
 * Traverse DOM to extract person data
 */
function process(emitter, $dom){
  debug('processing');
  
  var gedx = new GedcomX();
  
  /*
  var personData = {};
  
  // Gather list of events. Store in map keyed by event title.
  // In the future if we want to gather events that could occur multiple times,
  // such as residence, then we'll need to change this to an array.
  var facts = {};
  
  $dom.find('#factsSection .LifeEvent').each(function(){
    var $card = $(this),
        name = $card.find('.cardSubtitle')
          // Remove the embedded and hidden fact age
          .children('.factAge').remove()
          .end()
          .text().toLowerCase().trim(),
        value = $card.find('.cardTitle');
    facts[name] = value;
  });
  
  // Name
  
  var nameParts = utils.splitName(facts.name.text().trim());
  personData.givenName = nameParts[0];
  personData.familyName = nameParts[1];
  
  // Vitals
  
  if(facts.birth){
    var birth = processEvent(facts.birth);
    personData.birthDate = birth.date;
    personData.birthPlace = birth.place;
  }
  
  if(facts.death){
    var death = processEvent(facts.death);
    personData.deathDate = death.date;
    personData.deathPlace = death.place;
  }
  
  // Relationships
  
  var $lists = $dom.find('#familySection > .researchList'),
      $parents = $lists.first().find('.card'),
      $father = $parents.first(),
      $mother = $parents.eq(1);
  
  if(!$father.is('.cardEmpty')){
    var fatherNameParts = getNameParts($father);
    personData.fatherGivenName = fatherNameParts[0];
    personData.fatherFamilyName = fatherNameParts[1];
  }
  
  if(!$mother.is('.cardEmpty')){
    var motherNameParts = getNameParts($mother);
    personData.motherGivenName = motherNameParts[0];
    personData.motherFamilyName = motherNameParts[1];
  }
  
  var $spouse = $lists.eq(1).find('.card').first();
  if(!$spouse.is('.cardEmpty')){
    var spouseNameParts = getNameParts($spouse);
    personData.spouseGivenName = spouseNameParts[0];
    personData.spouseFamilyName = spouseNameParts[1];
  }
  
  // TODO: get marriage event that matches this spouse
  */
  
  emitter.emit('data', gedx);
}

/**
 * Get the name parts from a relative's card
 */
function getNameParts($card){
  return utils.splitName($card.find('.userCardTitle').text().trim());
}

/**
 * Split the event string on the • which separates the
 * date from the place. Also uncapitalize month abbreviation.
 */
function processEvent($event){
  return {
    date: utils.toTitleCase($event.find('.factItemDate').text().trim()),
    place: $event.find('.factItemLocation').text().trim()
  };
}

/**
 * Parse an HTML string into DOM objects. Returns the string wrapped in a parent div
 * 
 * @param {String} html
 * @returns {HTMLElement}
 */
function parseHTML(html){
  var div = window.document.createElement('div');
  div.innerHTML = html;
  return div;
}