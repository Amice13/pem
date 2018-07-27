// Підключаємо необхідні модулі
var elasticsearch = require('elasticsearch')

// Підключаємося до Elasticsearch
var client = new elasticsearch.Client({
  host: 'localhost:9200'
})

// Перевірка роботи кластера
client.ping({
  requestTimeout: 30000,
}, function (error) {
  if (error) {
    throw('Кластер Elasticsearch не працює!')
  } else {
    console.log('Кластер Elasticsearch працює')
  }
})

var ukrainianStopWords = ['а', 'або', 'але', 'б', 'без', 'би', 'бо', 'був',
  'буде', 'була', 'були', 'було', 'бути', 'в', 'вам', 'вами', 'вас', 'ваш',
  'ваша', 'ваше', 'вашим', 'вашими', 'ваших', 'ваші', 'вашій', 'вашого',
  'вашої', 'вашому', 'вашою', 'вашу', 'вже', 'ви', 'від', 'він', 'вона',
  'вони', 'воно', 'всі', 'де', 'для', 'до', 'дуже', 'є', 'з', 'за', 'зі',
  'і', 'із', 'її', 'їй', 'їм', 'їх', 'й', 'його', 'йому', 'ким', 'кого',
  'коли', 'кому', 'лише', 'має', 'мене', 'мені', 'ми', 'мій', 'мною',
  'мого', 'моє', 'моєї', 'моєму', 'моєю', 'можна', 'мої', 'моїй', 'моїм',
  'моїми', 'моїх', 'мою', 'моя', 'на', 'нам', 'нами', 'нас', 'наш', 'наша',
  'наше', 'нашим', 'нашими', 'наших', 'наші', 'нашій', 'нашого', 'нашої',
  'нашому', 'нашою', 'нашу', 'неї', 'нею', 'ним', 'ними', 'них', 'ній',
  'нім', 'ну', 'нього', 'ньому', 'під', 'після', 'по', 'при', 'про', 'саме',
  'себе', 'собі', 'та', 'так', 'також', 'там', 'твій', 'твого', 'твоє',
  'твоєї', 'твоєму', 'твоєю', 'твої', 'твоїй', 'твоїм', 'твоїми', 'твоїх',
  'твою', 'твоя', 'те', 'тебе', 'ти', 'тим', 'тими', 'тих', 'ті', 'тієї',
  'тією', 'тій', 'тільки', 'тім', 'то', 'тобі', 'тобою', 'того', 'тоді',
  'той', 'тому', 'ту', 'тут', 'у', 'хто', 'це', 'цей', 'ці', 'цього', 'цьому',
  'через', 'чи', 'чиє', 'чиєї', 'чиєму', 'чиї', 'чиїй', 'чиїм', 'чиїми', 'чиїх',
  'чий', 'чийого', 'чийому', 'чим', 'чию', 'чия', 'чого', 'чому', 'що', 'щоб',
  'щодо', 'щось', 'я', 'як', 'яка', 'який', 'які', 'якщо']

// Налаштування для індекса
var globalSettings = {
  'index.mapping.total_fields.limit': 5000,
  'index.mapping.nested_fields.limit': 500,
  'index': {
    'number_of_shards': 8,
    'analysis': {
      'analyzer': {
        'default': { 'type': 'ukrainian' },
        'ukrainian': {
          'type': 'ukrainian',
          'stopwords': ukrainianStopWords
        }
      }
    }
  }
}

var addressProperties = {
  'streetAddress': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword'
      }
    }
  },
  'locality': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword'
      }
    }
  },
  'region': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword'
      }
    }
  },
  'postalCode': { 'type': 'keyword' },
  'countryName': {
    'type': 'text',
    'fields': {
      'keyword': {
        'type': 'keyword'
      }
    }
  }
}

var revisionProperties = {
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'changes': {
    'type': 'nested',
    'properties': {
      'changes': { 'type': 'keyword' }
    }
  }
}

var contractDurationProperties = {
  'years': { 'type': 'integer' },
  'days': { 'type': 'integer' }
}

var valueProperties = {
  'amount': { 'type': 'float' },
  'currency': { 'type': 'keyword' },
  'valueAddedTaxIncluded': { 'type': 'boolean' },
  'annualCostsReduction': { 'type': 'float' },
  'yearlyPaymentsPercentage': { 'type': 'float' },
  'amountPerformance': { 'type': 'float' },
  'contractDuration': {
    'type': 'object',
    'properties': contractDurationProperties
  }
}

var identifierProperties = {
  'scheme': { 'type': 'keyword' },
  'id': { 'type': 'keyword' },
  'legalName': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword'
      }
    }
  },
  'uri': { 'type': 'keyword', 'index': false }
}

var contactPointProperties = {
  'name': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword'
      }
    }
  },
  'email': { 'type': 'keyword' },
  'telephone': { 'type': 'keyword' },
  'faxNumber': { 'type': 'keyword' },
  'url': { 'type': 'keyword', 'index': false }
}

var classificationProperties = {
  'scheme': { 'type': 'keyword' },
  'id': { 'type': 'keyword' },
  'description': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': { 'type': 'keyword' }
    }
  },
  'uri': { 'type': 'keyword', 'index': false }
}

var unitProperties = {
  'code': { 'type': 'keyword' },
  'name': { 'type': 'keyword' }
}

var parameterProperties = {
  'code': { 'type': 'keyword' },
  'value': { 'type': 'float' }
}

var lotValueProperties = {
  'value': {
    'type': 'object',
    'properties': valueProperties
  },
  'relatedLot': { 'type': 'keyword' },
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'participationUrl': { 'type': 'keyword', 'index': false }
}

var periodProperties = {
  'startDate': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'endDate': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' }
}

var enumProperties = {
  'value': { 'type': 'float' },
  'title': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword'
      }
    }
  },
  'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  }
}

var organizationProperties = {
  'name': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword'
      }
    }
  },
  'identifier': {
    'type': 'object',
    'properties': identifierProperties
  },
  'additionalIdentifiers': {
    'type': 'nested',
    'properties': identifierProperties
  },
  'address': {
    'type': 'object',
    'properties': addressProperties
  },
  'contactPoint': {
    'type': 'object',
    'properties': contactPointProperties
  },
  'kind': { 'type': 'keyword' }
}

var itemProperties = {
  'id': { 'type': 'keyword' },
  'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'classification': {
    'type': 'object',
    'properties': classificationProperties
  },
  'additionalClassifications': {
    'type': 'nested',
    'properties': classificationProperties
  },
  'unit': {
    'type': 'object',
    'properties': unitProperties
  },
  'quantity': { 'type': 'float' },
  'deliveryDate': {
    'type': 'object',
    'properties': periodProperties
  },
  'deliveryAddress': {
    'type': 'object',
    'properties': addressProperties
  },
  'deliveryLocation': { 'type': 'geo_point' }, // Note, pipeline is required to convert 'latitude' and 'longitude' to 'lat' and 'lon' and remove 'elevation'
  'relatedLot': { 'type': 'keyword' }
}

var featureProperties = {
  'code': { 'type': 'keyword' },
  'featureOf': { 'type': 'keyword' },
  'relatedItem': { 'type': 'keyword' },
  'title': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword',
      }
    }
  },
  'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'enum': {
    'type': 'nested',
    'properties': enumProperties
  }
}

var documentProperties = {
  'id': { 'type': 'keyword' },
  'documentType': { 'type': 'keyword' },
  'title': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword',
      }
    }
  },
  'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'format': { 'type': 'keyword' },
  'url': { 'type': 'keyword', 'index': false },
  'datePublished': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'dateModified': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'language': { 'type': 'keyword' },
  'documentOf': { 'type': 'keyword' },
  'relatedItem': { 'type': 'keyword' }
}

var questionProperties = {
  'id': { 'type': 'keyword' },
  'author': {
    'type': 'object',
    'properties': organizationProperties
  },
  'title': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword',
      }
    }
  },
  'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'dateAnswered': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'answer': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'questionOf': { 'type': 'keyword' },
  'relatedItem': { 'type': 'keyword' }
}

var complaintProperties = {
  'id': { 'type': 'keyword' },
  'author': {
    'type': 'object',
    'properties': organizationProperties
  },
  'title': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword',
      }
    }
  },
  'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'dateSubmitted': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'dateAnswered': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'dateEscalated': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'dateDecision': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'dateCanceled': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'status': { 'type': 'keyword' },
  'type': { 'type': 'keyword' },
  'resolution': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'resolutionType': { 'type': 'keyword' },
  'satisfied': { 'type': 'boolean' },
  'decision': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'cancellationReason': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'documents': {
    'type': 'nested',
    'properties': documentProperties
  },
  'relatedLot': { 'type': 'keyword' },
  'tendererAction': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'tendererActionDate': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' }
}

var bidProperties = {
  'tenderers': {
    'type': 'nested',
    'properties': organizationProperties
  },
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'id': { 'type': 'keyword' },
  'status': { 'type': 'keyword' },
  'value': {
    'type': 'object',
    'properties': valueProperties
  },
  'documents': {
    'type': 'nested',
    'properties': documentProperties
  },
  'parameters': {
    'type': 'nested',
    'properties': parameterProperties
  },
  'lotValues': {
    'type': 'nested',
    'properties': lotValueProperties
  },
  'participationUrl': { 'type': 'keyword', 'index': false }
}

var awardProperties = {
  'id': { 'type': 'keyword' },
  'bid_id': { 'type': 'keyword' },
  'title': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword',
      }
    }
  },
 'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'status': { 'type': 'keyword' },
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'value': {
    'type': 'object',
    'properties': valueProperties
  },
  'suppliers': {
    'type': 'nested',
    'properties': organizationProperties
  },
  'items': {
    'type': 'nested',
    'properties': itemProperties
  },
  'documents': {
    'type': 'nested',
    'properties': documentProperties
  },
  'complaints': {
    'type': 'nested',
    'properties': complaintProperties
  },
  'complaintPeriod': {
    'type': 'object',
    'properties': periodProperties
  },
  'lotID': { 'type': 'keyword' }
}

var contractProperties = {
  'id': { 'type': 'keyword' },
  'awardID': { 'type': 'keyword' },
  'contractID': { 'type': 'keyword' },
  'contractNumber': { 'type': 'keyword' },
  'title': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword',
      }
    }
  },
 'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'value': {
    'type': 'object',
    'properties': valueProperties
  },
  'suppliers': {
    'type': 'nested',
    'properties': organizationProperties
  },
  'items': {
    'type': 'nested',
    'properties': itemProperties
  },
  'status': { 'type': 'keyword' },
  'period': {
    'type': 'object',
    'properties': periodProperties
  },
  'dateSigned': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'documents': {
    'type': 'nested',
    'properties': documentProperties
  }
}

var cancellationProperties = {
  'id': { 'type': 'keyword' },
  'reason': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'status': { 'type': 'keyword' },
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'documents': {
    'type': 'nested',
    'properties': documentProperties
  },
  'cancellationOf': { 'type': 'keyword' },
  'relatedLot': { 'type': 'keyword' }

}

var lotProperties = {
  'id': { 'type': 'keyword' },
  'title': {
    'type': 'text',
    'analyzer': 'ukrainian',
    'fields': {
      'keyword': {
        'type': 'keyword',
      }
    }
  },
  'description': {
    'type': 'text',
    'analyzer': 'ukrainian'
  },
  'value': {
    'type': 'object',
    'properties': valueProperties
  },
  'guarantee': {
    'type': 'object',
    'properties': valueProperties
  },
  'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
  'minimalStep': {
    'type': 'object',
    'properties': valueProperties
  },
  'auctionPeriod': {
    'type': 'object',
    'properties': periodProperties
  },
  'auctionUrl': { 'type': 'keyword', 'index': false },
  'status': { 'type': 'keyword' }
}

var tenderMapping = {
  'settings': globalSettings,
  'mappings': {
    'tender': {
      'properties': {
        'title': {
          'type': 'text',
          'analyzer': 'ukrainian',
          'fields': {
            'keyword': {
              'type': 'keyword',
            }
          }
        },
        'description': {
          'type': 'text',
          'analyzer': 'ukrainian'
        },
        'tenderID': { 'type': 'keyword' },
        'tenderID': { 'type': 'keyword' },
        'procuringEntity': {
          'type' : 'object',
          'properties': organizationProperties
        },
        'value': {
          'type': 'object',
          'properties': valueProperties
        },
        'guarantee': {
          'type': 'object',
          'properties': valueProperties
        },
        'date': { 'type': 'date', 'format': 'strict_date_optional_time||epoch_second' },
        'items': {
          'type': 'nested',
          'properties': itemProperties
        },
        'features': {
          'type': 'nested',
          'properties': featureProperties
        },
        'documents': {
          'type': 'nested',
          'properties': documentProperties
        },
        'questions': {
          'type': 'nested',
          'properties': questionProperties
        },
        'complaints': {
          'type': 'nested',
          'properties': complaintProperties
        },
        'bids': {
          'type': 'nested',
          'properties': bidProperties
        },
        'minimalStep': {
          'type': 'object',
          'properties': valueProperties
        },
        'awards': {
          'type': 'nested',
          'properties': awardProperties
        },
        'contracts': {
          'type': 'nested',
          'properties': contractProperties
        },
        'enquiryPeriod': {
          'type': 'object',
          'properties': periodProperties
        },
        'tenderPeriod': {
          'type': 'object',
          'properties': periodProperties
        },
        'auctionPeriod': {
          'type': 'object',
          'properties': periodProperties
        },
        'auctionUrl': {
          'type': 'keyword',
          'index': false
        },
        'awardPeriod': {
          'type': 'object',
          'properties': periodProperties
        },
        'status': { 'type': 'keyword' },
        'lots': {
          'type': 'nested',
          'properties': lotProperties
        },
        'cancellations': {
          'type': 'nested',
          'properties': cancellationProperties
        },
        'funders': {
          'type': 'nested',
          'properties': organizationProperties
        },
        'revisions': {
          'type': 'nested',
          'properties': revisionProperties
        }
      }
    }
  }
}

client.indices.create({index: 'tender', body: tenderMapping},
 (err, res) => {
  if (err) {
    console.log(err)
  } else {
    console.log('Схему тендерів Prozorro створено')
  }
})
