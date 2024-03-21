class MoveRoleToUserColumn < ActiveRecord::Migration[6.0]
  def up
    add_column :users, :roles, :string, array: true, default: []

    execute <<~SQL
      WITH user_roles AS (
        SELECT users.id, array_agg(roles.name) as roles
        FROM users
        LEFT JOIN assignments ON assignments.user_id = users.id
        LEFT JOIN roles ON roles.id = assignments.role_id
        WHERE LOWER(roles.name) <> 'user'
        GROUP BY users.id
      )
      UPDATE users
      SET roles = user_roles.roles
      FROM user_roles
      WHERE users.id = user_roles.id;
    SQL

    drop_table :assignments
    drop_table :roles
  end

  def down
    create_table :roles do |t|
      t.string :name, null: false
    end

    create_table :assignments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :role, null: false, foreign_key: true
      t.index %i[user_id role_id], unique: true
    end

    execute <<~SQL
      WITH all_roles AS (
        SELECT UNNEST(users.roles) AS role FROM users
      ),
      user_roles AS (
        SELECT DISTINCT role FROM all_roles
      )
      INSERT INTO roles (name) SELECT role FROM user_roles;
      
      WITH user_roles AS (
        SELECT users.id id, roles.id role_id 
        FROM users
        LEFT JOIN roles
        ON roles.name = ANY(users.roles)
        WHERE roles.id IS NOT NULL
      )
      INSERT INTO assignments (user_id, role_id)
        SELECT user_roles.id, user_roles.role_id FROM user_roles;
    SQL

    remove_column :users, :roles
  end
end
