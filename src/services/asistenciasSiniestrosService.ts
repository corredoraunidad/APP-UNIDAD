import { supabase } from '../config/supabase';
import type { Company, CompanyContact, CreateCompanyRequest, UpdateCompanyRequest } from '../types/asistencias-siniestros';

export class AsistenciasSiniestrosService {
  // Obtener todas las compañías con sus comentarios y contactos
  static async getAllCompanies(): Promise<{ companies: Company[] | null; error: string | null }> {
    try {
      // Obtener compañías
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (companiesError) {
        return { companies: null, error: companiesError.message };
      }

      if (!companiesData) {
        return { companies: [], error: null };
      }

      // Obtener comentarios de secciones para todas las compañías
      const { data: commentsData, error: commentsError } = await supabase
        .from('company_section_comments')
        .select('*');

      if (commentsError) {
        console.error('Error fetching section comments:', commentsError);
      }

      // Obtener contactos para todas las compañías
      const { data: contactsData, error: contactsError } = await supabase
        .from('company_contacts')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('name');

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
      }

      // Mapear los datos a la estructura esperada
      const companies: Company[] = companiesData.map(company => {
        // Mapear comentarios de secciones
        const sectionComments = commentsData?.reduce((acc, comment) => {
          if (comment.company_id === company.id) {
            acc[comment.section_type as keyof typeof acc] = comment.comments;
          }
          return acc;
        }, {} as any) || {};

        // Mapear contactos
        const contacts: CompanyContact[] = (contactsData || [])
          .filter(contact => contact.company_id === company.id)
          .map(contact => ({
            id: contact.id,
            companyId: contact.company_id,
            name: contact.name,
            position: contact.position,
            phone: contact.phone,
            email: contact.email,
            isPrimary: contact.is_primary,
            comments: contact.comments,
            createdAt: contact.created_at
          }));

        return {
          id: company.id,
          name: company.name,
          type: company.type,
          callCenter: company.call_center || [],
          assistance: company.assistance || [],
          autoReplacement: company.auto_replacement || [],
          website: company.website || [],
          websiteAttachments: company.website_attachments || [],
          contacts,
          sectionComments,
          createdAt: company.created_at,
          updatedAt: company.updated_at
        };
      });

      return { companies, error: null };
    } catch (error) {
      console.error('Error in getAllCompanies:', error);
      return { companies: null, error: 'Error al cargar las compañías' };
    }
  }

  // Obtener compañía por ID
  static async getCompanyById(id: string): Promise<{ company: Company | null; error: string | null }> {
    try {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (companyError) {
        return { company: null, error: companyError.message };
      }

      if (!companyData) {
        return { company: null, error: 'Compañía no encontrada' };
      }

      // Obtener comentarios de secciones
      const { data: commentsData } = await supabase
        .from('company_section_comments')
        .select('*')
        .eq('company_id', id);

      // Obtener contactos
      const { data: contactsData } = await supabase
        .from('company_contacts')
        .select('*')
        .eq('company_id', id)
        .order('is_primary', { ascending: false })
        .order('name');

      // Mapear comentarios
      const sectionComments = commentsData?.reduce((acc, comment) => {
        acc[comment.section_type as keyof typeof acc] = comment.comments;
        return acc;
      }, {} as any) || {};

      // Mapear contactos
      const contacts: CompanyContact[] = (contactsData || []).map(contact => ({
        id: contact.id,
        companyId: contact.company_id,
        name: contact.name,
        position: contact.position,
        phone: contact.phone,
        email: contact.email,
        isPrimary: contact.is_primary,
        comments: contact.comments,
        createdAt: contact.created_at
      }));

      const company: Company = {
        id: companyData.id,
        name: companyData.name,
        type: companyData.type,
        callCenter: companyData.call_center || [],
        assistance: companyData.assistance || [],
        autoReplacement: companyData.auto_replacement || [],
        website: companyData.website || [],
        websiteAttachments: companyData.website_attachments || [],
        contacts,
        sectionComments,
        createdAt: companyData.created_at,
        updatedAt: companyData.updated_at
      };

      return { company, error: null };
    } catch (error) {
      console.error('Error in getCompanyById:', error);
      return { company: null, error: 'Error al obtener la compañía' };
    }
  }

  // Crear nueva compañía
  static async createCompany(data: CreateCompanyRequest): Promise<{ company: Company | null; error: string | null }> {
    try {
      // Insertar compañía
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          type: data.type,
          call_center: data.callCenter,
          assistance: data.assistance,
          auto_replacement: data.autoReplacement,
          website: data.website
        })
        .select()
        .single();

      if (companyError) {
        return { company: null, error: companyError.message };
      }

      const companyId = companyData.id;

      // Insertar comentarios de secciones si existen
      if (data.sectionComments) {
        const commentsToInsert = Object.entries(data.sectionComments)
          .filter(([_, value]) => value && value.trim() !== '')
          .map(([sectionType, comments]) => ({
            company_id: companyId,
            section_type: sectionType,
            comments
          }));

        if (commentsToInsert.length > 0) {
          const { error: commentsError } = await supabase
            .from('company_section_comments')
            .insert(commentsToInsert);

          if (commentsError) {
            console.error('Error inserting section comments:', commentsError);
          }
        }
      }

      // Insertar contactos si existen
      if (data.contacts && data.contacts.length > 0) {
        // Filtrar contactos que tienen nombre (campo requerido en BD)
        const validContacts = data.contacts.filter(contact => contact.name && contact.name.trim() !== '');
        
        if (validContacts.length > 0) {
          const contactsToInsert = validContacts.map(contact => ({
            company_id: companyId,
            name: contact.name.trim(),
            position: contact.position || null,
            phone: contact.phone || null,
            email: contact.email || null,
            is_primary: contact.isPrimary || false,
            comments: contact.comments || null
          }));

          const { error: contactsError } = await supabase
            .from('company_contacts')
            .insert(contactsToInsert);

          if (contactsError) {
            console.error('Error inserting contacts:', contactsError);
          }
        }
      }

      // Obtener la compañía completa con todos los datos
      return await this.getCompanyById(companyId);
    } catch (error) {
      console.error('Error in createCompany:', error);
      return { company: null, error: 'Error al crear la compañía' };
    }
  }

  // Actualizar compañía
  static async updateCompany(id: string, data: UpdateCompanyRequest): Promise<{ company: Company | null; error: string | null }> {
    try {
      // Actualizar datos básicos de la compañía
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.callCenter !== undefined) updateData.call_center = data.callCenter;
      if (data.assistance !== undefined) updateData.assistance = data.assistance;
      if (data.autoReplacement !== undefined) updateData.auto_replacement = data.autoReplacement;
      if (data.website !== undefined) updateData.website = data.website;

      if (Object.keys(updateData).length > 0) {
        const { error: companyError } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', id);

        if (companyError) {
          return { company: null, error: companyError.message };
        }
      }

      // Actualizar comentarios de secciones
      if (data.sectionComments) {
        // Eliminar comentarios existentes
        await supabase
          .from('company_section_comments')
          .delete()
          .eq('company_id', id);

        // Insertar nuevos comentarios
        const commentsToInsert = Object.entries(data.sectionComments)
          .filter(([_, value]) => value && value.trim() !== '')
          .map(([sectionType, comments]) => ({
            company_id: id,
            section_type: sectionType,
            comments
          }));

        if (commentsToInsert.length > 0) {
          const { error: commentsError } = await supabase
            .from('company_section_comments')
            .insert(commentsToInsert);

          if (commentsError) {
            console.error('Error updating section comments:', commentsError);
          }
        }
      }

      // Actualizar contactos
      if (data.contacts !== undefined) {
        // Eliminar contactos existentes
        await supabase
          .from('company_contacts')
          .delete()
          .eq('company_id', id);

        // Insertar nuevos contactos
        if (data.contacts.length > 0) {
          // Filtrar contactos que tienen nombre (campo requerido en BD)
          const validContacts = data.contacts.filter(contact => contact.name && contact.name.trim() !== '');
          
          if (validContacts.length > 0) {
            const contactsToInsert = validContacts.map(contact => ({
              company_id: id,
              name: contact.name.trim(),
              position: contact.position || null,
              phone: contact.phone || null,
              email: contact.email || null,
              is_primary: contact.isPrimary || false,
              comments: contact.comments || null
            }));

            const { error: contactsError } = await supabase
              .from('company_contacts')
              .insert(contactsToInsert);

            if (contactsError) {
              console.error('Error updating contacts:', contactsError);
            }
          }
        }
      }

      // Obtener la compañía actualizada
      return await this.getCompanyById(id);
    } catch (error) {
      console.error('Error in updateCompany:', error);
      return { company: null, error: 'Error al actualizar la compañía' };
    }
  }

  // Eliminar compañía
  static async deleteCompany(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteCompany:', error);
      return { error: 'Error al eliminar la compañía' };
    }
  }

  // Actualizar archivos adjuntos del sitio web
  static async updateWebsiteAttachments(
    companyId: string, 
    attachmentIds: string[]
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ website_attachments: attachmentIds })
        .eq('id', companyId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in updateWebsiteAttachments:', error);
      return { error: 'Error al actualizar archivos adjuntos' };
    }
  }
}
