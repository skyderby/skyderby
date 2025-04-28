class UpdateOrganizableAndSponsorableTypes < ActiveRecord::Migration[7.0]
  def up
    execute <<-SQL
      UPDATE organizers
      SET organizable_type = 'PerformanceCompetition'
      WHERE organizable_type = 'Event' AND organizable_id IN (
        SELECT id FROM events WHERE rules = 0
      )
    SQL

    execute <<-SQL
      UPDATE organizers
      SET organizable_type = 'Boogie'
      WHERE organizable_type = 'Event' AND organizable_id IN (
        SELECT id FROM events WHERE rules = 2
      )
    SQL

    execute <<-SQL
      UPDATE sponsors
      SET sponsorable_type = 'PerformanceCompetition'
      WHERE sponsorable_type = 'Event' AND sponsorable_id IN (
        SELECT id FROM events WHERE rules = 0
      )
    SQL

    execute <<-SQL
      UPDATE sponsors
      SET sponsorable_type = 'Boogie'
      WHERE sponsorable_type = 'Event' AND sponsorable_id IN (
        SELECT id FROM events WHERE rules = 2
      )
    SQL
  end

  def down
    execute <<-SQL
      UPDATE organizers
      SET organizable_type = 'Event'
      WHERE organizable_type IN ('PerformanceCompetition', 'Boogie')
    SQL

    execute <<-SQL
      UPDATE sponsors
      SET sponsorable_type = 'Event'
      WHERE sponsorable_type IN ('PerformanceCompetition', 'Boogie')
    SQL
  end
end
