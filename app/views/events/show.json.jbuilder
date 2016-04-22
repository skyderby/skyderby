json.partial! @event, as: :event

json.sections @event.sections.order(:order), partial: 'sections/section',
                                            as: :section
json.competitors @event.competitors, partial: 'competitors/competitor',
                                    as: :competitor

json.tracks @event.event_tracks, partial: 'event_tracks/event_track',
                                as: :event_track

json.rounds @event.rounds, partial: 'events/rounds/round', as: :round

json.organizers @event.event_organizers, partial: 'event_organizers/event_organizer',
                                        as: :event_organizer

json.sponsors @event.sponsors, partial: 'sponsors/sponsor',
                              as: :sponsor
