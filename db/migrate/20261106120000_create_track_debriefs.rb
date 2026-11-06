class CreateTrackDebriefs < ActiveRecord::Migration[8.1]
  def change
    create_table :track_debriefs do |t|
      t.references :track, null: false, foreign_key: { on_delete: :cascade }, type: :integer, index: false
      t.string :discipline_key, null: false
      t.string :strategy, null: false, default: 'opus_single'
      t.integer :status, null: false, default: 0
      t.string :locale, null: false
      t.jsonb :inputs, null: false, default: {}
      t.jsonb :evidence, null: false, default: {}
      t.string :inputs_digest, null: false
      t.string :fingerprint, null: false
      t.text :content
      t.string :model
      t.string :prompt_version
      t.jsonb :usage
      t.text :error
      t.datetime :generated_at
      t.timestamps
    end

    add_index :track_debriefs, %i[track_id discipline_key strategy locale created_at],
              name: 'index_track_debriefs_lookup'
  end
end
