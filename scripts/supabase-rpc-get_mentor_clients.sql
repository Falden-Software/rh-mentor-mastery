
-- Função para buscar clientes de um mentor
CREATE OR REPLACE FUNCTION get_mentor_clients(input_mentor_id UUID)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.*
  FROM profiles p
  WHERE p.mentor_id = input_mentor_id
  AND p.role = 'client';
$$;
