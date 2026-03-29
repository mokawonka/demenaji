class AddIndexesForMapQueries < ActiveRecord::Migration[8.1]
  def change
    # Composite index for fast bounding box queries (longitude first is often better)
    add_index :places, [:gps_longitude, :gps_latitude], name: "index_places_on_lng_lat"

    # Index for the ORDER BY clause (very important when using LIMIT)
    add_index :places, :post_date, order: { post_date: :desc }, name: "index_places_on_post_date_desc"

    # Optional: covering index if you often need these columns together
    # add_index :places, [:gps_longitude, :gps_latitude, :post_date]
  end
end