var debug = require('debug')('findmypast-tree:Relations'),
    Person = require('./Person'),
    Family = require('./Family');

var Relations = function(data){
  this.data = data;
};

Relations.prototype.getPersonData = function(personId){
  
  personId = parseInt(personId, 10);
  
  var personData = {},
      person = this.getPerson(personId);
  
  if(person){
    
    // Main person vitals
    personData.givenName = person.getGivenName();
    personData.familyName = person.getSurname();
    personData.birthDate = person.getBirthDate();
    personData.birthPlace = person.getBirthPlace();
    personData.deathDate = person.getDeathDate();
    personData.deathPlace = person.getDeathPlace();
    
    
    if(this.data.Relations) {
      
      // Spouse and Marriage
      if(this.data.Relations.SpousalFamilys){
      
        var spouseFamilyId = this.data.Relations.SpousalFamilys[0];
        var spouseFamily = this.getFamily(spouseFamilyId);
        
        debug('spouseFamilyId:' + spouseFamilyId);
        
        if(spouseFamily){
          
          personData.marriageDate = spouseFamily.getMarriageDate();
          personData.marriagePlace = spouseFamily.getMarriagePlace();
          
          var spouseId = spouseFamily.getSpouseId(personId),
              spouse = this.getPerson(spouseId);
              
          if(spouse){
            
            personData.spouseGivenName = spouse.getGivenName();
            personData.spouseFamilyName = spouse.getSurname();
            
          }
        }
      }
      
      // Parents
      if(this.data.Relations.DirectFamilys){
        
        var parentsFamilyId = this.data.Relations.DirectFamilys[0],
            parentsFamily = this.getFamily(parentsFamilyId);
           
        debug('parentsFamilyId:' + parentsFamilyId);
            
        if(parentsFamily){
          
          var motherId = parentsFamily.getMotherId(),
              fatherId = parentsFamily.getFatherId(),
              mother = this.getPerson(motherId),
              father = this.getPerson(fatherId);
              
          if(mother){
            personData.motherGivenName = mother.getGivenName();
            personData.motherFamilyName = mother.getSurname();
          }
          
          if(father){
            personData.fatherGivenName = father.getGivenName();
            personData.fatherFamilyName = father.getSurname();
          }
        }
      }
    }
  }
  
  return personData;
};

Relations.prototype.getPerson = function(personId){
  debug('getPerson:' + personId);
  var person = _find(this.data.Persons, function(person){
    return person.Id === personId;
  });
  if(person){
    return new Person(person);
  }
};

Relations.prototype.getFamily = function(familyId){
  debug('getFamily:' + familyId);
  var family = _find(this.data.Familys, function(family){
    return family.Id === familyId;
  });
  if(family){
    return new Family(family);
  }
};

function _find(list, func){
  for(var i = 0; i < list.length; i++){
    if(func(list[i])){
      return list[i];
    }
  }
}

module.exports = Relations;