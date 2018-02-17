class ResponsibleProfileToResponsibleUser < ActiveRecord::Migration[5.1]
  def up
    add_column :events, :responsible_id, :integer
    add_column :tournaments, :responsible_id, :integer

    %w[events tournaments].each do |table|
      execute(<<~SQL)
        UPDATE #{table}
        SET responsible_id = profiles.owner_id
        FROM profiles
        WHERE #{table}.profile_id = profiles.id
        AND profiles.owner_type = 'User'
      SQL
    end

    # remove_column :events, :profile_id
    # remove_column :tournaments, :profile_id
  end

  def down
    # add_column :events, :profile_id, :integer
    # add_column :tournaments, :profile_id, :integer
    #
    # execute(<<~SQL)
    #   UPDATE events
    #   SET profile_id = profiles.id
    #   FROM profiles
    #   WHERE events.responsible_id = profiles.owner_id
    #   AND profiles.owner_type = 'User'
    # SQL
    #
    # execute(<<~SQL)
    #   UPDATE tournaments
    #   SET profile_id = profiles.id
    #   FROM profiles
    #   WHERE tournaments.profile_id = profiles.owner_id
    #   AND profiles.owner_type = 'User'
    # SQL

    remove_column :events, :responsible_id
    remove_column :tournaments, :responsible_id
  end
end
