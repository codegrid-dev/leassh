// Multi-select vocabularies. These mirror the chip_options table, which is the
// authority the server validates against. Held here too so the form renders
// without a round trip.
export const ANIMALS = [
  ["small_dogs", "Small dogs"], ["large_dogs", "Large dogs"], ["puppies", "Puppies"],
  ["cats", "Cats"], ["small_pets", "Rabbits and small pets"], ["birds", "Birds"],
  ["reptiles", "Reptiles"], ["senior_pets", "Senior pets"], ["medication", "Pets needing medication"],
];

export const ATTRIBUTES = [
  ["enclosed_garden", "Enclosed garden"], ["car", "Car for pet taxi"],
  ["no_other_pets", "No other pets at home"], ["home_all_day", "Home most of the day"],
  ["early_mornings", "Happy with early mornings"], ["weekends_only", "Weekends only"],
];

export const CREDENTIALS = [
  ["council_licence", "Council animal activity licence"],
  ["public_liability", "Public liability insurance"],
  ["dbs", "DBS or Disclosure Scotland"],
  ["canine_first_aid", "Canine first aid"],
  ["grooming", "Grooming qualification"],
  ["veterinary", "Veterinary or nursing qualification"],
  ["none_yet", "None of these yet"],
];

// "'None of these yet' deselects the other credential chips when ticked."
export const CREDENTIAL_EXCLUSIVE = "none_yet";
