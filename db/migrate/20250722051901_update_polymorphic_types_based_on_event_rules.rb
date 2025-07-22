class UpdatePolymorphicTypesBasedOnEventRules < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      UPDATE profiles 
      SET owner_type = CASE WHEN events.rules = 2 THEN 'Boogie' ELSE 'PerformanceCompetition' END
      FROM events
      WHERE profiles.owner_type = 'Event' AND profiles.owner_id = events.id
    SQL

    execute <<-SQL
      UPDATE organizers 
      SET organizable_type = CASE WHEN events.rules = 2 THEN 'Boogie' ELSE 'PerformanceCompetition' END
      FROM events
      WHERE organizers.organizable_type = 'Event' AND organizers.organizable_id = events.id
    SQL

    execute <<-SQL
      UPDATE sponsors 
      SET sponsorable_type = CASE WHEN events.rules = 2 THEN 'Boogie' ELSE 'PerformanceCompetition' END
      FROM events
      WHERE sponsors.sponsorable_type = 'Event' AND sponsors.sponsorable_id = events.id
    SQL
  end

  def down
    execute "UPDATE profiles SET owner_type = 'Event' WHERE owner_type IN ('Boogie', 'PerformanceCompetition')"
    execute "UPDATE organizers SET organizable_type = 'Event' WHERE organizable_type IN ('Boogie', 'PerformanceCompetition')"
    execute "UPDATE sponsors SET sponsorable_type = 'Event' WHERE sponsorable_type IN ('Boogie', 'PerformanceCompetition')"
  end
end
