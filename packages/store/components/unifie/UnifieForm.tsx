import { Form, Input, Space, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { iUnifieFormSchema } from 'types/unifieForms';

export const dynamic = 'force-dynamic';

interface iUnifieFormProps {
  schema: iUnifieFormSchema;
  initialValues?: any;
}

export const UnifieForm = (props: iUnifieFormProps) => {
  const { t } = useTranslation('common');

  const schema = props.schema;

  if (typeof window === 'undefined') {
    return null;
  }
  return (
    <Space direction="vertical">
      {schema.properties.map((item, index) => {
        if (item.type === 'string') {
          return (
            <Form.Item label={t(item.label)} name={item.name} key={index}>
              <Input type="text" />
            </Form.Item>
          );
        } else if (item.type === 'boolean') {
          return (
            <Form.Item label={t(item.label)} name={item.name} key={index}>
              <Switch />
            </Form.Item>
          );
        }
        return <Input type="text" key={index} value={item.name} />;
      })}
    </Space>
  );
};
