UPDATE interaction_types
SET interaction_type_name =
    CASE
        WHEN interaction_type_id = 1 THEN 'like'
        WHEN interaction_type_id = 2 THEN 'dislike'
        WHEN interaction_type_id = 3 THEN 'save'
        WHEN interaction_type_id = 4 THEN 'share'
        WHEN interaction_type_id = 5 THEN 'report'
    END
WHERE interaction_type_id IN (1, 2, 3, 4, 5);
